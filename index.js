Survey
    .StylesManager
    .applyTheme("modern");


// Helper function for the silly random file names
function randomFileName() {
    adjectives_list = [
        "acceptable", "agreeable", "amazing", "amicable",
        "awesome", "cool", "cordial", "excellent",
        "exceptional", "extraordinary", "fair", "friendly",
        "impressive", "kind", "likable", "magnificent",
        "memorable", "okay", "outstanding", "pleasant",
        "polite", "rare", "satisfied", "significant",
        "sweet", "well", "wonderful", "unique"
    ];
    colors_list = [
        "red","orange", "yellow", "green",
        "blue", "indigo", "violet", "purple",
        "pink", "gold", "beige", "brown",
        "grey",  "black", "white", "silver"
    ];
    animals_list = [
        "ant","bee","bear","butterfly",
        "camel","cat","caterpillar","chicken","cow",
        "crab","crocodile","deer","dog",
        "dolphin","donkey","duck","elephant",
        "fish","frog","giraffe","goat",
        "hamster","hedgehog","horse","jellyfish",
        "ladybird","sheep","lion","mole",
        "monkey","mouse","octopus","owl",
        "panda","penguin","pig","pony",
        "rabbit","seahorse","snake","spider",
        "starfish","stingray","tiger","turkey",
        "turtle","unicorn","whale","worm",
        "zebra","pigeon","dinosaur","dragon",
        "kangaroo","clownfish","rhinoceros","toad",
        "puppy","hippo","rat","ostrich","peacock"
    ];
    var adjective = adjectives_list[
        Math.floor(Math.random()*adjectives_list.length)
    ];
    var color = colors_list[
        Math.floor(Math.random()*colors_list.length)
    ];
    var animal = animals_list[
        Math.floor(Math.random()*animals_list.length)
    ];
    return adjective + "-" + color + "-" + animal;
}// randomFileName


// Helper function to prompt user for JSON file download
function downloadJSON(json_data, file_name) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json_data));
    var dlAnchorElem = document.getElementById('downloadJSON');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", file_name + ".json");
    dlAnchorElem.click();
} // downloadJSON


// Use the survey to assign scores to the Navigator Layer, and then download it.
function resultsToNavigator(results_json) {
    var navigator_json = false;
    // Get the "baseline" Navigator JSON
    $.getJSON("./attack_utils/enterprise_layer.json", function(attack_json) {
        // For each Technique ID ...
        jQuery.each(attack_json['techniques'], function(i, val) {
            // Get the Survey Result
            var user_result = results_json[val['techniqueID']] || false;
            // If not-skipped, assign a score
            if (user_result != false) {
                switch(user_result) {
                    case "Not Critical":
                        val['score'] = 0;
                        break;
                    case "Neutral":
                        val['score'] = 50;
                        break;
                    case "Very Critical":
                        val['score'] = 100;
                        break;
                } // end switch
            } // end if user_result
        }); // end jQuery.each
        // Assign JSON to variable
        navigator_json = attack_json;
    }).done(function(){
        // Once done, name it ...
        var file_name = randomFileName();
        navigator_json["name"] = file_name;
        // ... then download it.
        downloadJSON(navigator_json, file_name);
    });
} // resultsToNavigator


// Create the Survey based on specified JSON
function buildAttackJSON() {
    // Create Survey general settings
    var json = {
        title: "Gamify MITRE ATT&CK!",
        showProgressBar: "bottom",
        showTimerPanel: "bottom",
        maxTimeToFinishPage: 10,
        // maxTimeToFinish: 25,
        firstPageIsStarted: true,
        startSurveyText: "Start Survey",
        pages: [{
            questions: [
                {
                    type: "html",
                    html: "You are about to start a survey about how you feel about all of the ATT&CK Techniques. <br/><br/>You have 10 seconds for every Techinque ID, for you to rate as: <em>Not-Critical, Neutral, or Very-Critical</em>.<br/><br/>Please click on <b>'Start Survey'</b> button when you are ready. (You can 'skip' a question, by clicking 'Next'.)"
                }
            ]
        }],
        completedHtml: "<h4>You are done! Here's your file!</h4><br/><br/><br/><div>Now use <a href='./merge.html'>Merge<a/> to combine your results and create a Navigator layer!</div>"
    };
    // Use the JSON to create the questions ...
    $.getJSON("./attack_utils/attack_json_by_id.json", function(attack_json) {
        // For each Technique ID ...
        jQuery.each(attack_json, function(i, val) {
            // Assign the question name & score criteria
            json.pages.push({
                "questions": [{
                    "type": "radiogroup",
                    "name": i,
                    "title": val.name + " (" + i + ")",
                    "choices": ["Not Critical", "Neutral", "Very Critical"]
                }]
            }) // end json.pages.push
        }); // end jQuery.each
    }).done(function(){
        // Once done, mint it.
        window.survey = new Survey.Model(json);
        // Define "when-done" features ...
        survey
            .onComplete
            .add(function (result) {
                // (Optional) Print out result...
                // document
                //     .querySelector('#surveyResult')
                //     .textContent = "Result JSON:\n" + JSON.stringify(result.data, null, 3);

                // Convert Survery Results, to Navigator Layer
                resultsToNavigator(result.data);
            });
        // Set the element
        $("#surveyElement").Survey({model: survey});
    }); // end $.getJSON
} // buildAttackJSON


// Kickoff creation of the survey using ATT&CK JSON
buildAttackJSON();