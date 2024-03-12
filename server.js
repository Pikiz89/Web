const http = require("http");
const server = http.createServer();
const port = 8080;

const fs = require("fs");
const commentaires = []
server.on("request", (req,res)=>{
    console.log(req.url);
    if(req.url === "/mur"){
        let css = '<link rel="stylesheet" href="/style.css">';
        let html = '<!DOCTYPE html><html><head>'+css+'</head><body>';
        html+='<a href="/">index</a><div class="center">';
        //html+='<a href="/image-description.html">Ajouter un commentaire</a>';
        html+='<h1>Le mur d\'image</h1><div class="murImage">';
        const images = fs.readdirSync('./images');
        for (let i = 0; i < images.length; i++){
            if (images[i].endsWith('_small.jpg')){
                html += '<a href="/page-image/'+ images[i].split('_')[0].split('e')[1] +'">';
                html += '<img src="/images/'+ images[i] +'"></a>';
            }
        }
        html+='</div></div></body></html>';
        res.end(html);
    }else if (req.url.startsWith('/page-image/')){
        let id = req.url.split('/')[2];
        let head = '<link rel="stylesheet" href="/style.css"><meta charset="UTF-8">';
        let html = '<!DOCTYPE html><html><head>'+head+'</head><body>';
        html +='<a href="/mur">mur</a><div class="center">';
        //ajout de l'image
        html += '<img src="/images/image'+id+'.jpg" width="300"/><h3>Magnifique image</h3><h4>Commentaires :</h4>';
        //commentaires
        html += commentaires[id];
        html+='<form action="/image-description/' + id + '" method="POST"><label for="Commentaire">Votre commentaire :';
        html+='<input type="text" name="Commentaire"></label><input type="submit" name="Envoyer un commentaire">';
        html+='</form></div>';
        const sizeOfImages = (fs.readdirSync('./images').length-1)/2;
        id=parseInt(id);
        if (id>1 && id<sizeOfImages){
            html += '<a class="left" href="/page-image/'+ (id-1)+'"><img src="/images/image'+(id-1)+'_small.jpg"/></a>';
            html += '<a  class="right" href="/page-image/'+ (id+1)+'"><img src="/images/image'+(id+1)+'_small.jpg"/></a>';          
        }else if(id == 1){
            html += '<a class="right" href="/page-image/2"><img src="/images/image2_small.jpg"/></a>';
        }else if(id == sizeOfImages){
            html += '<a class="left" href="/page-image/'+ (id-1)+'"><img src="/images/image'+(id-1)+'_small.jpg"/></a>';
        }else{
            res.end(fs.readFileSync('./index.html'));
            return;
        }
        html+='</body></html>';
        res.end(html);
    }else if(req.method === "POST" && req.url.startsWith("/image-description/")){
        let id = req.url.split("/")[2];
        console.log(id);
        let data;
        req.on("data", (dataChunk)=>{
            data += dataChunk.toString();
            console.log(`dataChunk : ${data}`);
        })
        req.on("end", ()=>{
            let parametres = data.split("&");
            //let ImageNumber = 3;// parametres[0].split("=")[1];
            let Commentaire = parametres[0].split("=")[1];
            console.log(`Image Number : ${id} ; Commentaire : ${Commentaire} ; ${commentaires[id]}`);
            if (commentaires[id] === undefined){
                commentaires[id] = "-- " + Commentaire + " --<br>";
            }else{
                commentaires[id] += "-- " + Commentaire + " --<br>";
            }
            res.statusCode = 302;
            let redirection = '/page-image/'+id
            res.setHeader('Location', redirection);
            res.end();
        })
    }//LOGO
    else if(req.url === "/logo.png"){
        const path = `./images${req.url}`
        const logo = fs.readFileSync(path);
        res.end(logo);
    }//CSS
    else if(req.url === "/style.css"){
        const path = `.${req.url}`
        const style = fs.readFileSync(path);
        res.end(style);
    }
    //IMAGES
    else if(req.method === "GET" && req.url.startsWith('/images/')){
        try {
            const image = fs.readFileSync('.' + req.url);
            res.end(image);
        } catch (error) {
            console.log(error);
            res.end("<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'></head><body><h1>404 Not Found</h1>L'image demandée n'existe pas !</body></html>");
        }
    }else{
        const home = fs.readFileSync("./index.html", "utf-8");
        res.end(home);
    }
})

server.listen(port, ()=>{
    console.log(`Server running on port : ${port}`);
});
