import { H3 } from '@/components/ui/typography';
import { DemoProps } from './registry';

export default function EnterpriseRagDemo({ slug, title }: DemoProps) {
  return (
    <div>
      <H3>
        {slug} - {title}
      </H3>
    </div>
  );
}
