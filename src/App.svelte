<script>
	import { onMount } from "svelte";
	import Board, {renderBoard} from "./components/board.svelte";

	onMount(() => {
		renderBoard()
	})
</script>

<main>
	<div style="backgroud-color: grey; margin-top: 40px; margin-left: 10%">
		<Board />
	</div>
</main>

<style>
</style>
