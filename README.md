# Crimson Web Engine
Plain JS + WGSL on WebGPU. FigureBlox-style renderer (HDR, 4x MSAA, PBR, cascaded shadows, skybox, haze, bloom) on top of a
Roblox-style engine architecture:
- src/engine/datamodel.js  Instance tree (Name/Parent/Children, typed properties, Changed signals), services, Vector3/Color3
- src/engine/serialize.js  .cblx (XML) and .cbxm (binary, columnar, zero-copy mesh blobs, time-sliced async decode)
- src/engine/luau.js       sandboxed Lua/Luau-style interpreter bound to the data model (not Luau-on-Wasm; no yielding wait())
- src/engine/physics.js    rigid bodies, box/sphere/cylinder collisions, friction, sleeping, WeldConstraint, SpringConstraint, voxel terrain
- src/engine/net.js        binary snapshot + delta replication, RemoteEvents, loopback and WebSocket transports
- server/ws-server.mjs     dependency-free Node WebSocket game server: node server/ws-server.mjs
- tests/                   Node tests: node tests/t1_datamodel.mjs ... t6_pipeline.mjs
The browser demo runs the server and a replica client in one page over a simulated 40 ms binary loopback link.
Not tested on real GPU hardware by the author. No Roblox or other third-party assets.
