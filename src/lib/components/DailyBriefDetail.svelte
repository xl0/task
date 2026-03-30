<script lang="ts">
	import { workspace } from '$lib/stores/workspace.svelte';
	import { resolve } from '$app/paths';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import type { Actionable, DailyBriefing } from '$lib/types';
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

	const decideActionables = $derived(
		workspace.getActionablesByAction('decide').filter((actionable) => actionable.status === 'open')
	);
	const delegateActionables = $derived(
		workspace
			.getActionablesByAction('delegate')
			.filter((actionable) => actionable.status === 'open')
	);
	const ignoreActionables = $derived(
		workspace.getActionablesByAction('ignore').filter((actionable) => actionable.status === 'open')
	);

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

	function actionableHref(actionable: Actionable) {
		return resolve(`/${actionable.action}/${actionable.id}`);
	}
</script>

<div class="flex flex-col gap-1 border-b border-border px-6 py-4">
	<div class="flex items-center gap-2">
		<h2 class="flex-1 text-base font-semibold">Daily Brief</h2>
		<Badge variant="outline" class="text-xs">{formatDateTime(briefing.generatedAt)}</Badge>
	</div>
</div>

<ScrollArea class="flex-1 overflow-hidden">
	<div class="flex flex-col gap-6 px-6 py-4">
		<section class="flex flex-col gap-2">
			<h3 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Brief</h3>
			<div
				class="prose prose-sm max-w-none text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:text-foreground [&_p]:text-foreground"
			>
				{@html renderedMarkdown}
			</div>
		</section>

		<Separator />
		<section class="flex flex-col gap-3">
			<h3 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">
				Must Decide Now
			</h3>
			{#each decideActionables as item (item.id)}
				<article class="flex flex-col gap-2 border border-border p-3">
					<a
						href={actionableHref(item)}
						class="text-sm font-medium underline-offset-2 hover:underline"
					>
						{item.title}
					</a>
					<p class="text-sm text-muted-foreground">{item.summary}</p>
				</article>
			{/each}
			{#if decideActionables.length === 0}
				<p class="text-sm text-muted-foreground">No open decide actionables.</p>
			{/if}
		</section>
		<!-- 

		<Separator />
		<section class="flex flex-col gap-3">
			<h3 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Delegated</h3>
			{#each delegateActionables as item (item.id)}
				<article class="flex flex-col gap-2 border border-border p-3">
					<a
						href={actionableHref(item)}
						class="text-sm font-medium underline-offset-2 hover:underline"
					>
						{item.title}
					</a>
					<p class="text-sm text-muted-foreground">{item.summary}</p>
				</article>
			{/each}
			{#if delegateActionables.length === 0}
				<p class="text-sm text-muted-foreground">No open delegated actionables.</p>
			{/if}
		</section>

		<Separator />

		<section class="flex flex-col gap-3">
			<h3 class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Watchlist</h3>
			{#each ignoreActionables as item (item.id)}
				<article class="flex flex-col gap-2 border border-border p-3">
					<a
						href={actionableHref(item)}
						class="text-sm font-medium underline-offset-2 hover:underline"
					>
						{item.title}
					</a>
					<p class="text-sm text-muted-foreground">{item.summary}</p>
				</article>
			{/each}
			{#if ignoreActionables.length === 0}
				<p class="text-sm text-muted-foreground">No open watchlist items.</p>
			{/if}
		</section> -->
	</div>
</ScrollArea>
