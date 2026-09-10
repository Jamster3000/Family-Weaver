<script lang="ts">
	import ConfirmModal from "$components/app/ConfirmModal.svelte";
	import { modals } from "$modalStore";

	let {
		onConfirm = () => {},
		onCancel = () => {},
	} : {
		onConfirm?: () => void;
		onCancel?: () => void;
	} = $$props;

	function handleConfirm() {
		modals.close("confirmSavePerson");
		onConfirm();
	}

	function handleClose() {
		modals.close("confirmSavePerson");
		onCancel();
	}

</script>

<ConfirmModal
	isOpen={$modals.confirmSavePerson}
	title="No relationships added"
	message="You haven't added any relationships for this person. Are you sure you want to save?"
	confirmLabel="Save"
	cancelLabel="Cancel"
	onConfirm={handleClose}
	onClose={handleClose}
/>