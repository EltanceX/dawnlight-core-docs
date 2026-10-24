## Behavior and constraints {#behavior}

This vocabulary belongs to command_list@1 and executes in array order. Full structure retains each type's conditional required/forbidden rules. The generic command object's optional fields cannot all be used with every type.

| type | Program and behavior |
| --- | --- |
| fullscreen | Required graphics Program; draws to named targets |
| present | Required graphics Program; draws to the default framebuffer rather than arbitrary MRT |
| compute | Required compute Program; dispatch.groups is a three-dimensional workgroup count, with declared barriers |
| engineDraw | Trusted provider/id/version invocation; Program is optional, with further Scene provider/category constraints |
| copy | No Program; source/destination, aspects, filter and restore define framebuffer transfer |
| clear | No Program; clears named targets or a supported default framebuffer with format-compatible values |
| historyCommit | No Program; resource must be history; marks frame completion without inventing a read/write access |

Copy v1 permits one direct texture2D color or depth aspect, exact matching formats and nearest depth filtering. History views, stencil and combined aspects are rejected. A history resource commits at most once per frame, must have a same-frame writer and must order every writer before commit. Missing, duplicate, later or unordered writers fail.

A Program-backed engineDraw owns its invocation Program, bindings/semantics/targets/state; the Provider retains trusted geometry submission and dynamic inputs. BuiltIn fallback is a declaration recipe and forbids pack Program, bindings, semantics and drawBuffers. Viewport source/restore/synchronizeScissor and state restoration also belong to the execution contract; failure must not leave partial GL state.
