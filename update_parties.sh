#!/bin/bash

partyIds=("kd" "kesk" "kok" "ps" "rkp" "sdp" "vas" "vihr")
baseDir="../partyFiles"

for partyId in "${partyIds[@]}"; do
    printf "\n --- Running npm generate for Party ID: $partyId \n"
    npm run generate "$partyId" "$baseDir/$partyId"
    printf "\n --- Done with Party ID: $partyId \n"
done

printf "\n --- All parties updated \n"
cd ..