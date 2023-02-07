import path from 'path';
import dedent from 'string-dedent';

export default function generate({ iconComponentOutputPath, iconComponentFileName, spriteOutputPath, spriteFileName, version, icons }) {
  const spriteAbsolutePath = path.resolve(spriteOutputPath, `${spriteFileName}.svg`);
  const iconComponentAbsolutePath = path.resolve(iconComponentOutputPath, `${iconComponentFileName}.tsx`);

  const spriteRelativeDir = path.relative(
    path.dirname(iconComponentAbsolutePath),
    path.dirname(spriteAbsolutePath),
  );

  return dedent`
    import { forwardRef, type ForwardRefRenderFunction } from "react";
    import spriteUrl from "${spriteRelativeDir}/${spriteFileName}.svg";

    export interface SeedIconProps {
      name: IconName;
      className?: string;
    };

    const SeedIcon: ForwardRefRenderFunction<HTMLSpanElement, SeedIconProps> = (
      { name, className },
      ref,
    ) => {
      return  (
        <span
          ref={ref}
          className={className}
          data-seed-icon={name}
          data-seed-icon-version="${version}"
        >
          <svg viewBox="0 0 24 24">
            <use href={\`\${spriteUrl}#\${name}\`} />
          </svg>
        </span>
      );
    };
    
    export default forwardRef(SeedIcon);

    type IconName = (
      | ${icons.map(JSON.stringify).join('\n  | ')}
    );\n
  `;
}

console.log(generate({
  iconComponentOutputPath: 'src',
  iconComponentFileName: 'SeedIcon',
  spriteOutputPath: 'assets',
  spriteFileName: 'sprite',
  version: '1.0.0',
  icons: [
    'icon_add_circle_fill',
    'icon_add_circle_regular',
    'icon_add_circle_thin',
  ],
}));
