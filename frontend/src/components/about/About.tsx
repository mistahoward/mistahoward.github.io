import { useRef, useState } from "preact/hooks";
import { AboutMe } from "./AboutMe";
import { SkillsList } from "./SkillsList";
import { ExperienceList } from "./ExperienceList";
import { CertificationsList } from "./CertificationsList";
import { Testimonials } from "./Testimonials";

// focusablePanel: the panel itself takes a Tab stop when it doesn't open with something focusable.
const TABS = [
	{ id: "skills", label: "Skills", Panel: SkillsList, focusablePanel: false },
	{ id: "experience", label: "Experience", Panel: ExperienceList, focusablePanel: true },
	{ id: "certifications", label: "Certifications", Panel: CertificationsList, focusablePanel: true },
];

export const About = () => {
	const [activeTab, setActiveTab] = useState("skills");
	const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

	// Arrow keys, Home and End move between tabs, as in the WAI-ARIA tabs pattern.
	const onTabKeyDown = (event: KeyboardEvent, index: number) => {
		const last = TABS.length - 1;
		const keyTargets: Record<string, number> = {
			ArrowRight: index === last ? 0 : index + 1,
			ArrowLeft: index === 0 ? last : index - 1,
			Home: 0,
			End: last,
		};
		const next = keyTargets[event.key];
		if (next === undefined) return;
		event.preventDefault();
		setActiveTab(TABS[next].id);
		tabRefs.current[next]?.focus();
	};

	return (
		// Top padding only: the testimonials band at the bottom brings its own.
		<section id="about" className="min-vh-100 d-flex align-items-center justify-content-center pt-5">
			<div className="container">
				<div className="row justify-content-center align-items-start">
					<div className="col-lg-5 mb-4 mb-lg-0">
						<AboutMe />
					</div>
					<div className="col-lg-7">
						<div className="about-tabs" role="tablist" aria-label="About">
							{TABS.map((tab, index) => {
								const selected = activeTab === tab.id;
								return (
									<button
										key={tab.id}
										ref={element => {
											tabRefs.current[index] = element;
										}}
										type="button"
										role="tab"
										id={`about-tab-${tab.id}`}
										aria-selected={selected}
										aria-controls={`about-panel-${tab.id}`}
										tabIndex={selected ? 0 : -1}
										className={`about-tab${selected ? " active" : ""}`}
										onClick={() => setActiveTab(tab.id)}
										onKeyDown={event => onTabKeyDown(event, index)}
									>
										{tab.label}
									</button>
								);
							})}
						</div>
						<div className="about-tab-panel">
							{TABS.map(({ id, Panel, focusablePanel }) => (
								<div
									key={id}
									id={`about-panel-${id}`}
									role="tabpanel"
									aria-labelledby={`about-tab-${id}`}
									tabIndex={focusablePanel ? 0 : undefined}
									hidden={activeTab !== id}
									className="about-tab-pane"
								>
									<Panel />
								</div>
							))}
						</div>
					</div>
				</div>
				<Testimonials />
			</div>
		</section>
	);
};
