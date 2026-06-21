const key = "AIzaSyCFo6SRoLsyC5b49F5xEG6QDL5WChN3_7";
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hello' }] }] })
})
.then(r => r.json())
.then(d => {
  if (d.error) console.log("ERROR:", d.error.code, "-", d.error.message);
  else console.log("SUCCESS:", d.candidates[0].content.parts[0].text.substring(0, 50));
})
.catch(e => console.error("FETCH ERROR:", e.message));
