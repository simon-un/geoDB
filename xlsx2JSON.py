import pandas as pd
import time

def organizarDataframe(filename, sheet_name, id_to_index, skiprows, usecols = False, cols=None):
    '''Organiza un Dataframe, corrigiendo titulos, e indices.\n\n
    filename: str: Nombre del archivo.\n
    sheet_name: str: Nombre de la hoja.\n
    id_index: str: Identificacion o nombre de la columna usada como indice.\n
    skiprows: int: Numero de filas del documento xlsx que seran saltadas.\n
    usecols: bool: True, si va a utilizar columnas especificas del documento xlsx.\n
    cols: str: Si usecols=True, la letra de las columnas del archivo xlsx. que va a utilizar.\n'''

    if usecols == True:
        df = pd.read_excel(filename + '.xlsx', sheet_name=sheet_name,
                           skiprows=list(range(1, skiprows)), usecols=cols)
    else:
        df = pd.read_excel(filename + '.xlsx', sheet_name=sheet_name,
                             skiprows=list(range(1, skiprows)))

    df.columns = df.iloc[0]
    df = df.drop(df.index[[0]])
    df.columns = [name.replace('\n', "") for name in df.columns]
    df.index = df[id_to_index]
    return df

def agruparDataframes(dfChild, group_by, nameChildColumn, dfParent):
    '''Inserta un Dataframe (dfChild) dentro de un Dataframe Parent (dfParent).\n\n
        Primero agrupa el dfChild segun la columna de interes (group_by), crea llaves (keys) de
        los resultados de el Dataframe agrupado y finalmente crea una columna en el Dataframe
        Parent con el mismo ID con el que agrupo (groupby); en la columna se inserta cada Dataframe
        que resulto del proceso de agrupado.\n\n

        dfChild: DataframeChild.\n
        group_by: str: ID Por el que desea agrupar.\n
        nameChildColumn: str: Nombre de la columna a insertar en el dfParent.\n
        dfParent: DataframeParent.\n'''

    grouped_df = dfChild.groupby(group_by)

    keys = []
    for key, item in grouped_df:
        keys.append(key)

    NameParentID = group_by
    dfParent[nameChildColumn] = dfParent[NameParentID].apply(lambda x: grouped_df.get_group(x) if x in keys else None)
    return dfParent

def main():

    t0 = time.time()
    filename = 'SPOILER_BDG_FOPAE_2011'
    df_muestra = organizarDataframe(filename, sheet_name='MUESTRA', id_to_index='ID_MUESTRA', skiprows=6, usecols=True, cols='D:Z')
    df_estrato = organizarDataframe(filename, sheet_name='ESTRATO', id_to_index='ID_ESTRATO', skiprows=6)
    df_exploracion = organizarDataframe(filename, sheet_name='EXPLORACION', id_to_index='ID_EXPLORACION', skiprows=6)

    df_estrato = agruparDataframes(dfChild=df_muestra, group_by='ID_ESTRATO', nameChildColumn='MUESTRAS', dfParent=df_estrato)
    df_exploracion = agruparDataframes(dfChild=df_estrato, group_by='ID_EXPLORACION', nameChildColumn='ESTRATOS', dfParent=df_exploracion)

    df_exploracion.to_json(filename + '.json', orient='index')
    print('[TIEMPO TOTAL DE EJECUCION: {}s]'.format(time.time() - t0))

if __name__ == '__main__':
    main() 