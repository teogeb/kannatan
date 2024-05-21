cd output
ls -1 | grep greyscale | sed 's/-greyscale.png//' | awk '{print $0 ".json"}' | xargs cat | jq -s '[.[]]' | jq 'map({statement: .statement | gsub("\"";""), reason, picture: (.party+"-"+(.created|tostring)+"-greyscale.png"), party: .party})'
