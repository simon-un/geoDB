import json

with open('public.json', 'r') as f:
    data = json.load(f)

data = data["PUBLIC"]
new_data = {}

for expl in data:
    new_data[expl] = {
        "geometry": {
            "coordinates":[
                data[expl]["Este"], data[expl]["Norte"]
            ],
            "type":"Point"
        },
        "properties":{
            "title":expl
        },
        "type": "Feature"
    }

with open('public_new.json', 'w') as file:
    json.dump(new_data, file)
