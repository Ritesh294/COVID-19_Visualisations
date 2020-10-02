import json
import numpy as np

file = open("./data/WHO-COVID-19-global-data.csv")

data = {}
count = 0
currentCountry = ""
output = open("./data/formatted.js", "w+")

for line in file:
    if count == 0:
        count += 1
        continue
    
    split = line.split(",")
    if currentCountry != split[1]:
        if currentCountry != "":
            output.write('},\n')
        output.write('"' + split[1] + '": {\n')
        currentCountry = split[1]
    output.write('"' + split[0] + '": [' + split[4] + ',' + split[5] + ',' + split[6] + ',' + split[7].rstrip() + '],\n')


#print(np.shape(data["New Zealand"]))

#jsonData = json.dumps(data)
#print(json.dumps(data, indent=4, sort_keys=True))