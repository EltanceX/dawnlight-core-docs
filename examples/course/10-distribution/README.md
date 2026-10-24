# Amber course 10-distribution / 琥珀课程

Website-authored teaching pack, Manifest 5 / Scene ABI 2, host f8aaa5c4218f54536ccf994a2d512aed2e3678b7.

## Install / 安装

Extract the ZIP as shaderpacks/10-distribution/shaderpack.json (no extra wrapper folder). In a creative test world run /switchshader 10-distribution. Use the authored Shader Pack settings to edit options and apply. Reload by switching to the same pack again. /switchshader builtin restores BuiltIn.

ZIP 解压后根目录直接包含 shaderpack.json。使用创造测试世界；修改设置后应用，切换同名包可重载。

## Appearance / 效果

Amber uses a gentle warm contrast. Public day_time and weather_precipitation inputs alter the grade; gain is typed custom data. Opaque Terrain uses stable stone/sand content mappings and a readonly materialTable SSBO; all other content uses a neutral fallback. Optional half-resolution glow adds a five-tap highlight pass. This is LDR soft glow, not HDR bloom. 

Chapter 05 returns from the MRT debug view to the chapter 03 color pipeline; the extra debug attachments are deliberately removed. Terrain alpha-tested, transparent and sorted-translucent routes keep host BuiltIn fallback.

## Options / 选项

course:grade (default true): disabling removes grade and glow from the active closure and presents scene color directly. course:strength (0–1, default 0.65) is a Program define and recompiles. course:gain (0.5–1.5, default 1) supplies a generation-frequency float; it is consumed only by grade. course:glow (default true) allocates a half-resolution RGBA8 output only when grade is enabled. 

## Presets / 预设

The JSON files in presets/ are Analyzer option override files and documented recipes, not an automatic host preset API. Balanced = all defaults; economy = grade on / glow off / strength 0.4 / gain 1; neutral = grade off / glow off. Apply the same values in the in-game settings. Optional amberdemo:MarbleBlock is a fictional integration example: onMissing=skip. Install no Mod to follow this course. Unmatched content uses course:neutral (shaderId 0).

## Verify / 验证

Run the pinned shaderpack-analyzer pack validate, scene explain, graph dump --contract 2 and program interface --contract 2 commands. For options use scene --options and data commands --options. Graph CLI on this baseline does not consume option overrides: use dawnlight/dumpGraph JSON-RPC inputs.options for branch graphs. See https://core.eltancex.top/tutorial/10-distribution and its English counterpart.

Check source/archive SHA-256 against the website inventory. Static success does not prove GPU compilation or runtime data. Use a creative world; load, edit settings, reload, resize, export reports, then switch to BuiltIn. Test Android, VR, different GPUs and device loss separately. No universal compatibility, performance gate or release-ready claim.

## Ownership / 来源

Course source: https://github.com/EltanceX/dawnlight-core-docs/tree/main/examples/course/10-distribution
Public host contracts: https://gitea.com/EltanceX/DawnlightCore at the pinned commit above. No host binary or private source is included.
