# ponytail-manual

Ponytail 手动调用版。来源于 DietrichGebert/ponytail 的极简工程理念，但移除了插件 hooks 和 always-on 自动注入。

## 本地策略

- 手动调用，不自动挂载。
- 不写全局 AGENTS。
- 不启用 lifecycle hooks。
- 默认建议 `lite` 或 `full`。
- 高风险任务只允许局部复杂度建议，不允许主导实现。

## 来源

https://github.com/DietrichGebert/ponytail

License: MIT