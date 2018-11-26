const config = require("./config");
const fetch = require("node-fetch");
const EpubPress = require("epub-press-js");
const getUrls = url => {
    console.log("fetching urls...");
    return new Promise(resolve => {
        const posts = [];
        const getPage = async page => {
            const response = await fetch(url + "/wp-json/wp/v2/posts/?per_page=100&page=" + page);
            const results = await response.json();
            results.forEach(post => posts.push(post.link));
            if (results.length === 100) {
                getPage(page + 1);
            } else {
                const result = posts.slice(0, config.limit || posts.length);
                console.log(`submitting ${result.length} links`);
                resolve(result);
            }
        }
        getPage(1);
    });
};
const createEbook = async meta => {
    const ebook = new EpubPress({
        title: meta.title,
        description: meta.description,
        urls: await getUrls(meta.url),
        filetype: meta.filetype
    });
    console.log("creating ebook...");
    await ebook.publish();
    console.log("downloading ebook...");
    await ebook.download(meta.filetype);
}
createEbook(config);
