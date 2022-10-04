```bash
ipfs-car --pack ./build/ --output /tmp/build.car --wrapWithDirectory false

curl -X 'POST' \
  'https://api.web3.storage/car' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/vnd.ipld.car' \
  --data-binary '@/tmp/build.car' \
  -H "Authorization: Bearer $WEB3STORAGE_TOKEN"
```
