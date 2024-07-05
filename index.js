const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');

const app = express();


// Middleware para parsear JSON
app.use(bodyParser.json());


let filename;




function preencherFilename(x) {
    filename = x;
}

// Função para verificar se a URL é do YouTube
const isYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
};

// Função para obter o link do vídeo do YouTube
async function obterLinkVideo(url) {
    try {
        const info = await ytdl.getInfo(url);
        const formatos = ytdl.filterFormats(info.formats, 'videoandaudio');

        if (formatos.length > 0) {
            // Retorna o URL do primeiro formato de vídeo encontrado
      
            preencherFilename(info.videoDetails.title);
          
            return formatos[0].url;
        } else {
            throw new Error('Nenhum formato de vídeo encontrado.');
        }
    } catch (error) {
        console.error('Erro ao obter o link do vídeo:', error);
        return null;
    }
}
async function obterLinkThumbVideo(url) {
    try {
        const info = await ytdl.getInfo(url);
       
        if (info.thumbnail_url != null) {
            // Retorna o URL do primeiro formato de vídeo encontrado
      
         
          
            return info.thumbnail_url;
        } else {
            throw new Error('Nenhum formato de vídeo encontrado.');
        }
    } catch (error) {
        console.error('Erro ao obter o link do vídeo:', error);
        return null;
    }
}

async function getVideoThumbnail(videoUrl) {
    try {
      // Fetch video information
      const info = await ytdl.getInfo(videoUrl);
  
      // Extract the thumbnails array
      const thumbnails = info.videoDetails.thumbnails;
  
      // Select the highest resolution thumbnail
      const highestResThumbnail = thumbnails[thumbnails.length - 1];
  
      return highestResThumbnail.url;
    } catch (error) {
      console.error('Error fetching video thumbnail:', error);
    }
  }
  
function getVideoLink(url) {
    // Cria um objeto URL a partir do link fornecido
    const urlObj = new URL(url);

    // Verifica se o parâmetro 'list' está presente na URL
    if (urlObj.searchParams.has('list')) {
        // Remove o parâmetro 'list' da URL
        urlObj.searchParams.delete('list');
        // Remove o parâmetro 'index' da URL, se presente
        urlObj.searchParams.delete('index');
        // Remove qualquer outro parâmetro que não seja 'v'
        for (const param of urlObj.searchParams.keys()) {
            if (param !== 'v') {
                urlObj.searchParams.delete(param);
            }
        }
    }

    // Retorna a URL modificada
    return urlObj.toString();
}

// Definição do endpoint /validate-url
app.post('/validate-url', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
    }

    const result = {
        isYouTubeUrl: isYouTubeUrl(url),
        message: isYouTubeUrl(url) ? 'A URL é do YouTube' : 'A URL não é do YouTube',
        link: '',
        title: '',
        thumb: '',
    };

    if (result.isYouTubeUrl) {
        const link = await obterLinkVideo(getVideoLink (url));
        const thumnLink = await getVideoThumbnail(getVideoLink (url));
        result.link = link ? link : 'Não foi possível obter o link do vídeo.';
        result.title = filename;
        result.thumb = thumnLink;
    }

    res.status(200).json(result);
});

// Inicia o servidor
app.listen( process.env.PORT || 3000, () => {
    console.log(`Servidor rodando em http://localhost:${ process.env.PORT || 3000}`);
});