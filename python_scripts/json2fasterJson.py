import json

with open('COORDS_SPOILER_BDG_FOPAE_2011.json', 'r') as f:
    data = json.load(f)

coords = {}

new_data = {'EXPLORACIONES': data}
data = new_data

data = data['EXPLORACIONES']

for expl in data:
    coords[expl] = {
        'Norte' : data[expl]['Norte'],
        'Este' : data[expl]['Este']
    }

new_data['COORDS'] = coords
with open('COORDS_SPOILER_BDG_FOPAE_2011.json', 'w') as file:
    json.dump(new_data, file)
