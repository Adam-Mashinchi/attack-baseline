import json
from pyattck import Attck


def main():
    attack = Attck()
    # Single object for all ID's
    attack_json = {}
    # Loop all techniques & sub-techniques
    for technique in attack.enterprise.techniques:
        # Store by TID
        attack_json[technique.id] = {
            "id": technique.id,
            "name": technique.name,
            "platforms": technique.platforms
        }
        # for subtechnique in technique.subtechniques:
        #     attack_json[subtechnique.id] = {
        #         "id": subtechnique.id,
        #         "name": subtechnique.name,
        #         "platforms": subtechnique.platforms
        #     }
    # Dump all to file
    with open('attack_json_by_id.json', 'w') as outfile:
        json.dump(attack_json, outfile)

    print("Total Techniques: %s" % len(attack_json))
    exit()

if __name__ == "__main__":
    main()
