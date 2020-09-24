import pandas as pd

filename = 'SPOILER_BDG_FOPAE_2011'

df = pd.read_excel(filename + '.xlsx', sheet_name='MUESTRA', skiprows=6)
df.columns = [name.replace('\n', "") for name in df.columns]

json = df.to_json('./{}.json'.format(filename), orient='records')