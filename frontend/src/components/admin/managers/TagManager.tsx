import { useState, useEffect } from "preact/hooks";
import { fetchItems, deleteItem, confirmDelete } from "../../../utils/crud";
import { ManagerLayout } from "../shared/ManagerLayout";

interface Tag {
	id: number;
	name: string;
}

export const TagManager = () => {
	const [tags, setTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const fetchTags = async () => {
		await fetchItems({
			endpoint: "/api/admin/tags",
			onSuccess: setTags,
			setError,
			setLoading,
		});
	};

	useEffect(() => {
		fetchTags();
	}, []);

	const handleDelete = async (id: number) => {
		const confirmed = await confirmDelete("this tag");
		if (!confirmed) return;

		await deleteItem(
			"/api/admin/tags",
			id,
			() => {
				setTags(prev => prev.filter(tag => tag.id !== id));
			},
			undefined,
			setError
		);
	};

	return (
		<ManagerLayout title="Tag Management" loading={loading} error={error} onCreate={() => {}} createButtonText="">
			<div className="flex-grow-1 overflow-auto">
				{tags.map(tag => (
					<div key={tag.id} className="card mb-2">
						<div className="card-body">
							<div className="d-flex justify-content-between align-items-center">
								<div className="flex-grow-1">
									<h5 className="card-title mb-1">{tag.name}</h5>
									<p className="text-muted small mb-0">Tag ID: {tag.id}</p>
								</div>
								<div className="d-flex gap-2">
									<button onClick={() => handleDelete(tag.id)} className="btn btn-danger btn-sm">
										Delete
									</button>
								</div>
							</div>
						</div>
					</div>
				))}
				{tags.length === 0 && !loading && <div className="text-muted text-center">No tags found.</div>}
			</div>
		</ManagerLayout>
	);
};
