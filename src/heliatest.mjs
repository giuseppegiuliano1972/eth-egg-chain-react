/* eslint-disable no-console */

import { unixfs } from '@helia/unixfs'
import { createHelia } from 'helia'
//import Helia from 'helia'
import { dagJson } from '@helia/dag-json'

// libraries to connect to local node
import { createLibp2p } from 'libp2p'
import { tcp } from '@libp2p/tcp'
import { noise } from '@chainsafe/libp2p-noise'
import { mplex } from '@libp2p/mplex'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { identifyService } from 'libp2p/identify'

// multiaddr convertion
import { multiaddr } from '@multiformats/multiaddr'

// define known peer addresses
const bootstrapMultiaddrs = [
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
  '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
]

// create a node with libp2p
const node = await createLibp2p({
  addresses: {
    listen: [
      '/ip4/127.0.0.1/tcp/5001'
    ]
  },
  transports: [tcp()],
  connectionEncryption: [noise()],
  streamMuxers: [yamux(), mplex()],
  peerDiscovery: [
    bootstrap({
      list: bootstrapMultiaddrs,
    })
  ],
  services: {
    identify: identifyService()
  }
});

// create a Helia node
const helia = await createHelia({ node });

console.log(node.getMultiaddrs());
//console.log(node.getMultiaddrs()[0]);
//const myaddress = multiaddr('/ip4/127.0.0.1/tcp/4001/p2p/12D3KooWFer5wjCtAdberTkFzGcZg77ePQ7GbcvH6zhxJWA4Rady')
//node.dial(myaddress);

// For saving a dagjson
const d = dagJson(helia);

const egg = { id : 1,
              ownerAddr: 1,
              farmerAddr: 1,
              price: 79,
              eggsInPackage: 1,
              state: "ultimotest" };
const eggID = await d.add(egg);

// only owner or farmer should be able to make transfer
const transfer = {  address: 2,
                    role: "delivery",
                    state: "acquired",
                    link: eggID }

const getegg = await d.get(eggID);
console.log(getegg);

console.log(eggID);

// legacy egg:
/*
        uint id;
        address payable ownerID; 
        address payable farmerAddr;
        string note;
        uint price;
        uint marketPrice;
        uint totalEggsInPackage;
        uint totalEggsInMarketPackage;
        State eggState;
        address deliveryAddr;
        address payable marketAddr;
        address payable foodFactoryAddr;
        address payable consumerAddr;
*/

// create a filesystem on top of Helia, in this case it's UnixFS
//const fs = unixfs(helia)

// we will use this TextEncoder to turn strings into Uint8Arrays
//const encoder = new TextEncoder()

// add the bytes to your node and receive a unique content identifier
/*const cid = await fs.addBytes(encoder.encode('Funziona? Funziona'), {
  onProgress: (evt) => {
    console.info('add event', evt.type, evt.detail)
  }
})*/

//console.log('Added file:', cid.toString())

// this decoder will turn Uint8Arrays into strings
/*const decoder = new TextDecoder()
let text = ''

for await (const chunk of fs.cat(cid, {
  onProgress: (evt) => {
    console.info('cat event', evt.type, evt.detail)
  }
})) {
  text += decoder.decode(chunk, {
    stream: true
  })
}

console.log('Added file contents:', text)*/