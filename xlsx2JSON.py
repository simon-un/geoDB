import pandas as pd

filename = 'SPOILER_BDG_FOPAE_2011'

df = pd.read_excel(filename + '.xlsx', sheet_name='EXPLORACION', skiprows=list(range(1,6)) + list(range(10,222)))
df.columns = df.iloc[0]
df = df.drop(df.index[[0]])
df.columns = [name.replace('\n', "") for name in df.columns]
df.index = df['ID_EXPLORACION']

df_estrato = pd.read_excel(filename + '.xlsx', sheet_name='ESTRATO', skiprows=list(range(1,6)) + list(range(48,2586)))
df_estrato.columns = df_estrato.iloc[0]
df_estrato = df_estrato.drop(df_estrato.index[[0]])
df_estrato.columns = [name.replace('\n', "") for name in df_estrato.columns]
df_estrato.index = df_estrato['ID_ESTRATO']

# Estratos agrupados por Exploracion
grouped_df = df_estrato.groupby('ID_EXPLORACION')

keys = []
for key, item in grouped_df:
    keys.append(key)

df['ESTRATOS'] = df['ID_EXPLORACION'].apply(lambda x: grouped_df.get_group(x) if x in keys else None)
df.to_json('prueba.json', orient='index')
