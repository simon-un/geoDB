import json

# El archivo COORDS_SPOILER_BDG_FOPAE_2011.json ya cuenta con el objeto "COORDS"
with open('../COORDS_SPOILER_BDG_FOPAE_2011.json', 'r') as f:
    data = json.load(f)

coords = {}
coordsGeojson = {}

new_data = {'EXPLORACIONES': data['EXPLORACIONES']}
data = new_data

data = data['EXPLORACIONES']

for expl in data:
    coords[expl] = {
        'Norte' : data[expl]['Norte'],
        'Este' : data[expl]['Este']
    }
    coordsGeojson[expl] = {
        "type": "Point",
        "coordinates": [data[expl]['Este'], data[expl]['Norte']]
    }

new_data['COORDS'] = coords
new_data["COORDSGEOJSON"] = coordsGeojson
with open('COORDS_SPOILER_BDG_FOPAE_2011.json', 'w') as file:
    json.dump(new_data, file)
