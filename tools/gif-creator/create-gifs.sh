#!/bin/bash
mkdir -p tmp
convert -size 1080x1080 'xc:#000000' background.png
for i in {1..20} 
do 
    cp background.png tmp/$i.png
done
convert -delay 0 -loop 0 -alpha set -dispose previous tmp/*.png background.gif
rm background.png
rm tmp/*.png

mkdir -p output
node index.js
rm background.gif