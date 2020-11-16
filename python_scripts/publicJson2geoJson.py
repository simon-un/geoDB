import json

with open('public_raw.json', 'r') as f:
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
            "title":expl,
            "clase": data[expl]["CLASE"],
            "nombre": data[expl]["NOMBRE_EXPLORACION"],
            "profundidad": data[expl]["PROFUNDIDAD_DE_EXPLORACION"],
            "nivel_freatico": data[expl]["NIVEL_FREATICO(m)"],
            "fecha": data[expl]["FECHA"],
            "direccion": data[expl]["DIRECCION"]
        },
        "layers": data[expl]["ESTRATOS"],
        "type": "Feature"
    }

with open('public_newest.json', 'w') as file:
    json.dump(new_data, file)
