# Canvas Template for Migration Proposal

When generating the interactive canvas in Phase 5, create a `.canvas.tsx` file
using this structure. Replace placeholder data with actual discovered values.

The canvas lives at the standard Cursor canvases path:
`~/.cursor/projects/<workspace>/canvases/migration-proposal.canvas.tsx`

## Template

```tsx
import {
  BarChart,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  PieChart,
  Pill,
  Row,
  Spacer,
  Stack,
  Stat,
  Table,
  Text,
} from 'cursor/canvas';

export default function MigrationProposal() {
  return (
    <Stack gap={24}>
      <H1>Migration Proposal: [Site Name]</H1>
      <Text tone="secondary">[URL] — [date]</Text>

      {/* --- Executive Summary --- */}
      <Grid columns={4} gap={12}>
        <Stat value="[n]" label="Pages Discovered" />
        <Stat value="[n]" label="Unique Templates" />
        <Stat value="[n]" label="Blocks Needed" />
        <Stat value="[grade]" label="Design Quality" />
      </Grid>

      <Grid columns={3} gap={12}>
        <Stat value="[n]" label="Reuse As-Is" tone="success" />
        <Stat value="[n]" label="Adapt" tone="warning" />
        <Stat value="[n]" label="Develop New" tone="danger" />
      </Grid>

      <Divider />

      {/* --- Normalization Delta --- */}
      <H2>Normalization Summary</H2>
      <Text tone="secondary">
        Source site patterns normalized to EDS best practices
      </Text>
      <Table
        headers={['Aspect', 'Source', 'Normalized', 'Change']}
        rows={[
          ['Color tokens', '[n]', '[n]', '-[n]'],
          ['Type sizes', '[n]', '[n]', '-[n]'],
          ['Spacing values', '[n]', '[n]', '-[n]'],
          ['Organisms', '[n]', '[n]', '-[n]'],
        ]}
        columnAlign={['left', 'right', 'right', 'right']}
      />

      <Divider />

      {/* --- Work Items by Phase --- */}
      <H2>Work Items by Execution Phase</H2>
      <BarChart
        categories={[
          'Discovery',
          'Design System',
          'Site Build',
          'Content Migration',
          'Testing & UAT',
        ]}
        series={[
          { name: 'Work Items', data: [0, 0, 0, 0, 0] },
        ]}
        height={220}
      />

      {/* --- Effort Distribution --- */}
      <H2>Effort Distribution</H2>
      <Grid columns={2} gap={16}>
        <Stack gap={8}>
          <H3>By Phase</H3>
          <PieChart
            data={[
              { label: 'Discovery', value: 0 },
              { label: 'Design System', value: 0 },
              { label: 'Site Build', value: 0 },
              { label: 'Content Migration', value: 0 },
              { label: 'Testing & UAT', value: 0 },
            ]}
            donut
          />
        </Stack>
        <Stack gap={8}>
          <H3>By T-Shirt Size</H3>
          <PieChart
            data={[
              { label: 'XS', value: 0 },
              { label: 'S', value: 0 },
              { label: 'M', value: 0 },
              { label: 'L', value: 0 },
              { label: 'XL', value: 0 },
            ]}
            donut
          />
        </Stack>
      </Grid>

      <Divider />

      {/* --- Block Inventory --- */}
      <H2>Block Inventory</H2>
      <Table
        headers={['Organism', 'EDS Block', 'Status', 'Effort']}
        rows={[
          // For each organism, add a row:
          // ['Hero section', 'hero', <Pill tone="success">Reuse</Pill>, 'XS'],
          // ['Pricing table', 'pricing-table', <Pill tone="danger">New</Pill>, 'L'],
        ]}
        striped
      />

      <Divider />

      {/* --- Integration Inventory --- */}
      <H2>Integrations</H2>
      <Table
        headers={['Service', 'Category', 'Strategy', 'Effort']}
        rows={[
          // ['Google Analytics', 'Analytics', <Pill>Preserve</Pill>, 'XS'],
          // ['Algolia Search', 'Search', <Pill tone="danger">Requires Solution</Pill>, 'XL'],
        ]}
        striped
      />

      <Divider />

      {/* --- Timeline --- */}
      <H2>Timeline</H2>
      <Table
        headers={['Phase', 'Duration', 'Min Hours', 'Max Hours', 'Key Gate']}
        rows={[
          ['1. Discovery', '[n] weeks', '[n]', '[n]', 'Approved work plan'],
          ['2. Design System', '[n] weeks', '[n]', '[n]', 'Signed-off design'],
          ['3. Site Build', '[n] weeks', '[n]', '[n]', 'All blocks implemented'],
          ['4. Content Migration', '[n] weeks', '[n]', '[n]', 'All content migrated'],
          ['5. Testing & UAT', '[n] weeks', '[n]', '[n]', 'Go-live approval'],
        ]}
        columnAlign={['left', 'center', 'right', 'right', 'left']}
      />

      <Grid columns={2} gap={12}>
        <Stat value="[n]-[n]" label="Total Effort (hours)" />
        <Stat value="[n]-[n]" label="Total Duration (weeks)" />
      </Grid>

      <Divider />

      {/* --- Risk Summary --- */}
      <H2>Risk Summary</H2>
      <Grid columns={4} gap={12}>
        <Stat value="[n]" label="Critical" tone="danger" />
        <Stat value="[n]" label="High" tone="warning" />
        <Stat value="[n]" label="Medium" tone="info" />
        <Stat value="[n]" label="Low" tone="neutral" />
      </Grid>

      <Table
        headers={['Risk', 'Category', 'Severity', 'Mitigation']}
        rows={[
          // Top risks only (critical + high)
        ]}
        striped
      />

      <Divider />

      {/* --- Atomic Mapping --- */}
      <H2>Atomic Design to EDS Mapping</H2>
      <Table
        headers={['Level', 'Count', 'EDS Artifact', 'Status']}
        rows={[
          ['Foundations', '[n] tokens', 'CSS custom properties', ''],
          ['Atoms', '[n] patterns', 'Default content + scripts.js', ''],
          ['Molecules', '[n] composites', 'Internal block structure', ''],
          ['Organisms', '[n] sections', 'EDS blocks', ''],
          ['Templates', '[n] types', 'Auto-blocking + guides', ''],
          ['Pages', '[n] pages', 'Authored content', ''],
        ]}
      />

      <Text tone="secondary" size="small">
        Generated by migration-planner skill — v1 draft based on automated
        discovery. Refine during Execution Phase 1 (Discovery).
      </Text>
    </Stack>
  );
}
```

## Usage Notes

- Replace all `[n]` and `[placeholder]` values with actual discovered data
- Add actual rows to tables (block inventory, integrations, risks)
- Pill tones: `success` for reuse, `warning` for adapt, `danger` for new/critical
- BarChart data array must align with categories array
- PieChart values must be positive numbers
- Do NOT use gradients, emojis, or box-shadows
- Read the canvas skill for full design guidance before generating
