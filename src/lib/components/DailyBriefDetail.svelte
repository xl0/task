<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { DailyBriefing } from '$lib/types';
	import { unified } from 'unified';
	import remarkParse from 'remark-parse';
	import remarkGfm from 'remark-gfm';
	import remarkRehype from 'remark-rehype';
	import rehypeStringify from 'rehype-stringify';

	let { briefing }: { briefing: DailyBriefing } = $props();

	const renderedMarkdown = $derived.by(() => {
		return String(
			unified()
				.use(remarkParse)
				.use(remarkGfm)
				.use(remarkRehype)
				.use(rehypeStringify)
				.processSync(briefing.markdown)
		);
	});

	function formatDateTime(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}
</script>

<section class="px-6 py-4">
	<div class="mb-3 flex items-center gap-2">
		<h2 class="flex-1 text-base font-semibold">Daily Brief</h2>
		<Badge variant="outline" class="text-xs">{formatDateTime(briefing.generatedAt)}</Badge>
	</div>

	<div
		class="prose prose-sm max-w-none text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground [&_p]:text-foreground"
	>
		{@html renderedMarkdown}
	</div>
</section>
