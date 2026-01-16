const fs = require("fs");
const https = require("https");

const REPO = "thiagowiegert/Mine-Api";
const FILE = "./versions.json";

function fetchJson(url){
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { "User-Agent": "GitHub-Action" }
    }, res => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

async function sync(){
  const releases = await fetchJson(
    `https://api.github.com/repos/${REPO}/releases`
  );

  let data = { versions: [] };
  if (fs.existsSync(FILE)) {
    data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  }

  releases.forEach(r => {
    if (!r.tag_name) return;
    if (data.versions.find(v => v.tag === r.tag_name)) return;

    data.versions.push({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      date: r.published_at,
      size: "AUTO",
      notes: (r.body || "").replace(/\n/g, "<br>"),
      changelog: r.html_url,
      download: ""
    });
  });

  data.versions.sort((a,b)=>new Date(b.date)-new Date(a.date));
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  console.log("versions.json actualizado");
}

sync();