# 04-mrt / 写入 MRT 数据

Write MRT data.

This is a complete, independent Manifest v5 / Scene ABI v2 snapshot for the
DawnlightCore author course. Host baseline: candidate-f8aaa5c4, commit
f8aaa5c4218f54536ccf994a2d512aed2e3678b7.

Extract into a fresh directory. The root must contain shaderpack.json and shaders/.
The file sources belong to this pack; built-in Terrain fallback shaders are not copied.
There are 5 persistent viewport textures and 6 commands.
Only opaque Terrain is overridden; the other three categories use built-in fallback.
Auxiliary MRT data describes opaque Terrain writes only, not the final visible surface of every renderer. The material encoding is a course convention, not a host G-buffer ABI.

Static checks are separate from game evidence. No driver compilation, game image,
reload, resize, device reset or switch-back test is claimed by this source snapshot.
Use a disposable world, preserve the previous selected pack and verify lifecycle
behavior before using this pack for normal play. No performance claim is made.

Course: https://core.eltancex.top/tutorial/04-mrt
English: https://core.eltancex.top/en/tutorial/04-mrt
Source: https://github.com/EltanceX/dawnlight-core-docs/tree/main/examples/course/04-mrt
