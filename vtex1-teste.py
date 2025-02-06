import requests
import pandas as pd
from datetime import datetime, timedelta
from urllib.parse import quote

url = "https://lojabagaggio.vtexcommercestable.com.br/api/oms/pvt/orders"

headers = {
    "Accept": "application/json",
    "X-VTEX-API-AppKey": "vtexappkey-lojabagaggio-TGLRXO",
    "X-VTEX-API-AppToken": "TNJJQTLQMYSFUYMMJYUKNAWAXCLFBEYKRKKPOEBBQWGYDAFVNWLAJNKLTQLNCJYTCWIKIWLXPMHMJNHKFDUMZPUAEALUGREJIAYGVHHLFDNATPWWUEFVRDNZCZDSPSSB"
}

# Data final é hoje
data_fim = datetime.now()
# Data inicial é 7 dias atrás
data_inicio = data_fim - timedelta(days=7)

# Formatando as datas no formato ISO 8601
data_inicio_str = data_inicio.strftime('%Y-%m-%dT%H:%M:%S.000Z')
data_fim_str = data_fim.strftime('%Y-%m-%dT%H:%M:%S.999Z')

print(f"\nFazendo requisição para: {url}")
print(f"Buscando pedidos de {data_inicio.strftime('%Y-%m-%d')} até {data_fim.strftime('%Y-%m-%d')}")

todos_pedidos = []
tem_mais = True
max_paginas = 50  # Limite de segurança para evitar loop infinito
pagina_atual = 1

while tem_mais and pagina_atual <= max_paginas:
    try:
        print(f"\nBuscando página {pagina_atual}...")
        
        params = {
            "f_creationDate": f"creationDate:[{data_inicio_str} TO {data_fim_str}]",
            "f_status": "payment-approved,invoiced",
            "per_page": "100",
            "page": str(pagina_atual),
            "orderBy": "creationDate,desc"
        }
        
        print(f"Fazendo requisição para página {pagina_atual}")
        response = requests.get(url, headers=headers, params=params)
        
        print(f"Status code da resposta: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Chaves na resposta: {data.keys()}")
            if 'list' in data:
                pedidos_pagina = data['list']
                if pedidos_pagina:
                    print(f"Número de pedidos nesta página: {len(pedidos_pagina)}")
                    todos_pedidos.extend(pedidos_pagina)
                    print(f"Total de pedidos até agora: {len(todos_pedidos)}")
                    pagina_atual += 1
                else:
                    print("Nenhum pedido encontrado nesta página")
                    tem_mais = False
            else:
                print(f"Resposta completa: {data}")
                print("Formato de resposta inesperado - 'list' não encontrado na resposta")
                tem_mais = False
        else:
            print(f"Erro na requisição: {response.status_code}")
            print(f"Resposta de erro: {response.text}")
            tem_mais = False
            
    except Exception as e:
        print(f"Erro detalhado: {str(e)}")
        import traceback
        print(f"Traceback completo:\n{traceback.format_exc()}")
        tem_mais = False

print(f"\nTotal de pedidos encontrados: {len(todos_pedidos)}")

if todos_pedidos:
    df = pd.DataFrame(todos_pedidos)
    arquivo_excel = "pedidos_ultimos_7_dias.xlsx"
    df.to_excel(arquivo_excel, index=False)
    print(f"Dados salvos com sucesso em '{arquivo_excel}'")
else:
    print("Nenhum pedido encontrado")
