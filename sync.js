const fs = require("fs");

const REPO = "thiagowiegert/Mine-Api";
const FILE = "./versions.json";

async function sync() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases`);
  const releases = await res.json();

  let data = { versions: [] };

  if (fs.existsSync(FILE)) {
    data = JSON.parse(fs.readFileSync(FILE, "utf8"));
  }

  releases.forEach(r => {
    if (!r.tag_name) return;

    const exists = data.versions.find(v => v.tag === r.tag_name);
    if (exists) return;

    data.versions.push({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      date: r.published_at,
      size: "AUTO",
      notes: (r.body || "Sin notas").replace(/\n/g, "<br>"),
      changelog: r.html_url,
      download: "" // MANUAL
    });
  });

  // Ordenar por fecha (más nueva primero)
  data.versions.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  console.log("✔ versions.json actualizado");
}

sync();
