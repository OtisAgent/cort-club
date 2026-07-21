import os,json,base64,hashlib,urllib.request,urllib.error
JWT=os.environ["CF_JWT"]
def sh(d): return base64.urlsafe_b64encode(hashlib.sha256(d).digest()).rstrip(b"=").decode()
files=[("index.html","text/html"),("styles.css","text/css")]
entries=[]
for f,ct in files:
    d=open(f,"rb").read()
    entries.append({"key":sh(d),"value":base64.b64encode(d).decode(),"metadata":{"contentType":ct},"base64":True})
def post(url,payload,tok):
    req=urllib.request.Request(url,data=json.dumps(payload).encode(),method="POST",
        headers={"Authorization":"Bearer "+tok,"Content-Type":"application/json"})
    try:
        with urllib.request.urlopen(req,timeout=60) as r: return json.load(r)
    except urllib.error.HTTPError as e: return {"HTTPERROR":e.code,"body":e.read().decode()[:400]}
BASE="https://api.cloudflare.com/client/v4/pages/assets"
miss=post(BASE+"/check-missing",{"hashes":[e["key"] for e in entries]},JWT)
print("check-missing:",json.dumps(miss)[:300])
need=set(miss.get("result",[])) if miss.get("success") else set(e["key"] for e in entries)
batch=[e for e in entries if e["key"] in need]
if batch:
    up=post(BASE+"/upload",batch,JWT)
    print("upload:",json.dumps(up)[:300])
uh=post(BASE+"/upsert-hashes",{"hashes":[e["key"] for e in entries]},JWT)
print("upsert:",json.dumps(uh)[:200])
print("KEYS",[e["key"] for e in entries])
