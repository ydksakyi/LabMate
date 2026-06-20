'use strict';

/* ══════════════════════════════════════════════
   MODULE: STORAGE
══════════════════════════════════════════════ */
const StorageModule = (() => {
	const CHAT_KEY = 'vla_chat_history';

	function saveChat(messages) {
		try {
			localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
		} catch (e) {}
	}

	function loadChat() {
		try {
			const data = localStorage.getItem(CHAT_KEY);
			return data ? JSON.parse(data) : [];
		} catch (e) {
			return [];
		}
	}

	function clearChat() {
		try {
			localStorage.removeItem(CHAT_KEY);
		} catch (e) {}
	}

	return { saveChat, loadChat, clearChat };
})();

function normalizeSearchText(value) {
	return String(value)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/* ══════════════════════════════════════════════
   MODULE: KNOWLEDGE BASE
══════════════════════════════════════════════ */
const KnowledgeModule = (() => {
	const knowledge = {
		ohms_law: `<strong>Ohm's Law</strong> states that the current through a conductor is directly proportional to the voltage and inversely proportional to the resistance.<br><br>
    <strong>Formula:</strong> V = I × R<br>
    • V = Voltage (Volts)<br>
    • I = Current (Amperes)<br>
    • R = Resistance (Ohms Ω)<br><br>
    <strong>Derived forms:</strong><br>
    • I = V / R (current)<br>
    • R = V / I (resistance)<br><br>
    <em class="warn">⚠ Always ensure circuit is de-energized before measuring resistance.</em>`,

		inductance: `<strong>Inductance (L)</strong> is the property of an electrical conductor that opposes changes in current flow.<br><br>
    <strong>Unit:</strong> Henry (H)<br>
    <strong>Key Formula:</strong> V = L × (dI/dt)<br><br>
    <strong>Types:</strong><br>
    • <em>Self-inductance:</em> Opposition to change in its own current<br>
    • <em>Mutual inductance:</em> Opposition induced in a nearby conductor<br><br>
    <strong>Applications:</strong> Transformers, motors, filters, chokes, energy storage in magnetic fields.<br><br>
    <strong>Inductive Reactance:</strong> Xl = 2πfL`,

		capacitance: `<strong>Capacitance (C)</strong> is the ability of a component to store electrical energy in an electric field.<br><br>
    <strong>Unit:</strong> Farad (F)<br>
    <strong>Key Formula:</strong> Q = C × V, where Q = charge, C = capacitance, V = voltage<br><br>
    <strong>Energy stored:</strong> E = ½CV²<br>
    <strong>Capacitive Reactance:</strong> Xc = 1/(2πfC)<br><br>
    <strong>Types:</strong> Ceramic, electrolytic, film, tantalum, supercapacitors<br><br>
    <em class="warn">⚠ Large capacitors can store dangerous charge — always discharge before handling!</em>`,

		transformer: `<strong>Transformers</strong> transfer electrical energy between circuits through electromagnetic induction.<br><br>
    <strong>Turns Ratio:</strong> Ns/Np = Vs/Vp = Ip/Is<br><br>
    <strong>Types:</strong><br>
    • Step-up: Ns > Np (increases voltage)<br>
    • Step-down: Ns < Np (decreases voltage)<br>
    • Isolation: Np = Ns (electrical isolation)<br><br>
    <strong>Efficiency:</strong> η = (Pout/Pin) × 100%<br>
    <strong>Losses:</strong> Core (hysteresis + eddy current), copper (I²R)<br><br>
    <em class="warn">⚠ High voltage hazard — follow all safety procedures!</em>`,

		motor: `<strong>Electric Motors</strong> convert electrical energy to mechanical energy using electromagnetic force.<br><br>
    <strong>DC Motors:</strong><br>
    • Series, shunt, compound, permanent magnet<br>
    • Torque ∝ Armature current<br>
    • Speed ∝ Back EMF / Flux<br><br>
    <strong>AC Motors:</strong><br>
    • Synchronous: speed = 120f/P<br>
    • Induction (async): most common industrial motor<br>
    • Slip = (Ns - Nr)/Ns × 100%<br><br>
    <strong>Key parameters:</strong> Torque, speed, efficiency, power factor`,

		generator: `<strong>Generators</strong> convert mechanical energy to electrical energy using Faraday's law of induction.<br><br>
    <strong>EMF:</strong> e = NBA ω sin(ωt)<br><br>
    <strong>DC Generator types:</strong> Series, shunt, compound<br>
    <strong>AC Generator (Alternator):</strong> Three-phase output, synchronous machine<br><br>
    <strong>Efficiency:</strong> η = Pout/Pin, typical 85–97%<br>
    <strong>Terminal voltage:</strong> VT = Ea - Ia×Ra (DC)<br><br>
    <em class="warn">⚠ Ensure proper grounding before testing any generator.</em>`,

		kirchhoff: `<strong>Kirchhoff's Laws</strong> govern current and voltage in electrical circuits.<br><br>
    <strong>KCL – Current Law:</strong> The sum of currents entering a node = sum leaving it.<br>
    ΣI<sub>in</sub> = ΣI<sub>out</sub><br><br>
    <strong>KVL – Voltage Law:</strong> The sum of all voltages around any closed loop = 0.<br>
    ΣV = 0 (around any loop)<br><br>
    <strong>Application:</strong> Used to solve complex networks with multiple sources and resistors (mesh analysis, nodal analysis).`,

		diode: `<strong>Diodes</strong> are semiconductor devices that allow current flow in one direction only.<br><br>
    <strong>Forward voltage:</strong> ~0.7V (silicon), ~0.3V (germanium)<br>
    <strong>Applications:</strong> Rectification, clipping, clamping, protection<br><br>
    <strong>Types:</strong> Zener, Schottky, LED, Photodiode, Varactor<br><br>
    <strong>Rectifier circuits:</strong><br>
    • Half-wave: uses 1 diode<br>
    • Full-wave bridge: uses 4 diodes, Vout ≈ 0.636Vm`,

		transistor: `<strong>Transistors</strong> are semiconductor devices used for amplification and switching.<br><br>
    <strong>BJT (Bipolar Junction):</strong><br>
    • Modes: Active, Saturation, Cut-off<br>
    • IC = β × IB<br>
    • Types: NPN, PNP<br><br>
    <strong>FET (Field Effect):</strong><br>
    • MOSFET, JFET<br>
    • Voltage-controlled device<br>
    • High input impedance<br><br>
    <strong>Applications:</strong> Amplifiers, switches, oscillators, logic gates`,

		multimeter: `<strong>Multimeter Usage Guide</strong><br><br>
    <strong>Voltage measurement (V):</strong><br>
    1. Set dial to V (AC ~) or V (DC ─)<br>
    2. Connect RED probe to positive terminal, BLACK to negative<br>
    3. Connect across the component/source<br><br>
    <strong>Current measurement (A):</strong><br>
    1. Set dial to A range<br>
    2. Break circuit and connect multimeter IN SERIES<br>
    3. Start with highest range<br><br>
    <strong>Resistance (Ω):</strong><br>
    1. Power off circuit and discharge capacitors<br>
    2. Connect probes across component<br><br>
    <em class="warn">⚠ Never measure resistance in a live circuit!</em>`,

		oscilloscope: `<strong>Oscilloscope Usage Guide</strong><br><br>
    <strong>Setup:</strong><br>
    1. Connect probe to CH1 (BNC connector)<br>
    2. Attach ground clip to circuit ground<br>
    3. Connect probe tip to signal point<br><br>
    <strong>Key Controls:</strong><br>
    • VOLTS/DIV: vertical scale (signal amplitude)<br>
    • TIME/DIV: horizontal scale (time/frequency)<br>
    • TRIGGER: sets stable waveform display<br><br>
    <strong>Measurements:</strong><br>
    • Amplitude = (divisions × V/div)<br>
    • Period T = (horizontal divisions × time/div)<br>
    • Frequency f = 1/T`,

		force: `<strong>Newton's Laws of Motion</strong><br><br>
    <strong>First Law:</strong> An object at rest stays at rest; in motion stays in motion unless acted on by a force.<br><br>
    <strong>Second Law:</strong> F = ma (Force = mass × acceleration)<br>
    • F in Newtons (N), m in kg, a in m/s²<br><br>
    <strong>Third Law:</strong> For every action there is an equal and opposite reaction.<br><br>
    <strong>Work & Energy:</strong><br>
    • W = F × d (Joules)<br>
    • P = W/t (Watts)<br>
    • KE = ½mv², PE = mgh`,

		waves: `<strong>Wave Properties</strong><br><br>
    <strong>Key relationships:</strong><br>
    • v = fλ (speed = frequency × wavelength)<br>
    • T = 1/f (period = 1/frequency)<br><br>
    <strong>Types:</strong><br>
    • Transverse: displacement ⊥ propagation (light, EM waves)<br>
    • Longitudinal: displacement ∥ propagation (sound)<br><br>
    <strong>Electromagnetic spectrum:</strong> Radio → Microwave → IR → Visible → UV → X-ray → Gamma<br><br>
    <strong>Sound:</strong> v ≈ 343 m/s in air at 20°C`,

		acid: `<strong>Acids and Bases</strong><br><br>
    <strong>Acids:</strong> pH < 7, donate H⁺ ions (Brønsted-Lowry)<br>
    <strong>Bases:</strong> pH > 7, accept H⁺ ions<br>
    <strong>Neutral:</strong> pH = 7 (pure water)<br><br>
    <strong>Strong acids:</strong> HCl, H₂SO₄, HNO₃ — fully dissociate<br>
    <strong>Weak acids:</strong> CH₃COOH — partially dissociate<br><br>
    <strong>Neutralization:</strong> Acid + Base → Salt + Water<br><br>
    <em class="warn crit">⚠ DANGER: Always add acid to water, never water to acid! Wear gloves, goggles, and lab coat.</em>`,

		molarity: `<strong>Molarity (Concentration)</strong><br><br>
    <strong>Formula:</strong> M = n/V<br>
    • M = molarity (mol/L)<br>
    • n = moles of solute (mol)<br>
    • V = volume of solution (L)<br><br>
    <strong>Moles from mass:</strong> n = m/M_r where M_r = molar mass (g/mol)<br><br>
    <strong>Dilution:</strong> C₁V₁ = C₂V₂<br><br>
    <em class="warn">Always wear PPE when preparing chemical solutions. Work in a fume hood for volatile substances.</em>`,

		power_supply: `<strong>Laboratory Power Supply</strong><br><br>
    <strong>Types:</strong><br>
    • Linear: stable, low noise — ideal for sensitive circuits<br>
    • Switch-mode (SMPS): efficient, compact<br><br>
    <strong>Setting up:</strong><br>
    1. Set voltage to 0 before connecting<br>
    2. Set current limit below your circuit's rating<br>
    3. Connect RED (+) and BLACK (–) leads<br>
    4. Slowly increase voltage to target<br><br>
    <em class="warn">⚠ Never exceed component voltage/current ratings!</em>`,

		breadboard: `<strong>Breadboard Basics</strong><br><br>
    <ul>
		<li>Power rails usually run along the outer edges.</li>
		<li>The center rows are connected in groups of five.</li>
		<li>The middle gap isolates the two halves of the board.</li>
		<li>Place dual-inline parts across the gap.</li>
		<li>Check continuity before applying power.</li>
    </ul>
    <em class="warn">Keep the supply off while rewiring.</em>`,

		function_generator: `<strong>Function Generator Basics</strong><br><br>
    <ul>
		<li>Select the waveform: sine, square, or triangle.</li>
		<li>Set frequency, amplitude, and DC offset before connecting.</li>
		<li>Start with a low amplitude and raise it slowly.</li>
		<li>Use the correct output mode for 50 ohm or high-impedance loads.</li>
		<li>Keep generator ground and circuit ground common.</li>
    </ul>`,

		pre_lab_checklist: `<strong>Pre-Lab Checklist</strong><br><br>
    <ul>
		<li>Read the aim and theory before entering the lab.</li>
		<li>List the formulas and expected values you will need.</li>
		<li>Identify every item of equipment and every safety risk.</li>
		<li>Prepare a blank data table before starting.</li>
		<li>Note what must be measured, calculated, and plotted.</li>
    </ul>`,

		lab_report_outline: `<strong>Lab Report Outline</strong><br><br>
    <ul>
		<li><strong>Title and aim</strong> - state the experiment and objective.</li>
		<li><strong>Theory</strong> - include the key formulas and principles.</li>
		<li><strong>Method</strong> - summarize the procedure in your own words.</li>
		<li><strong>Results</strong> - present tables, graphs, and observations.</li>
		<li><strong>Discussion</strong> - interpret trends and sources of error.</li>
		<li><strong>Conclusion</strong> - state what was proven or measured.</li>
    </ul>`,

		data_table_template: `<strong>Data Table Template</strong><br><br>
    <ul>
		<li>Trial number</li>
		<li>Input setting or condition</li>
		<li>Measured value</li>
		<li>Units</li>
		<li>Notes or anomalies</li>
    </ul>
    <em>Build the table before the experiment starts.</em>`,

		graphing_checklist: `<strong>Graphing Checklist</strong><br><br>
    <ul>
		<li>Label both axes and include units.</li>
		<li>Use a scale that fills most of the page.</li>
		<li>Plot points clearly and draw a best-fit line.</li>
		<li>Identify slope, intercept, and any outliers.</li>
		<li>Add error bars when uncertainty matters.</li>
    </ul>`,

		troubleshoot_no_output: `<strong>Troubleshooting: No Output</strong><br><br>
    <ul>
		<li>Verify the power supply is on and current limit is not tripped.</li>
		<li>Check that the ground reference is correct.</li>
		<li>Confirm component polarity and orientation.</li>
		<li>Test continuity from source to load.</li>
		<li>Probe the signal stage by stage to find the break point.</li>
    </ul>`,

		noisy_readings: `<strong>Fix Noisy Readings</strong><br><br>
    <ul>
		<li>Shorten leads and keep the ground lead short.</li>
		<li>Separate signal wiring from noisy power wiring.</li>
		<li>Use shielding, averaging, or a bandwidth limit when needed.</li>
		<li>Add decoupling capacitors near active devices.</li>
		<li>Check for loose contacts on the breadboard.</li>
    </ul>`,

		oscilloscope_clipping: `<strong>Oscilloscope Clipping</strong><br><br>
    <ul>
		<li>Increase volts/div or reduce the signal amplitude.</li>
		<li>Check the probe attenuation setting and scope factor.</li>
		<li>Center the waveform and reduce DC offset if needed.</li>
		<li>Make sure the input range is not exceeded.</li>
    </ul>`,

		component_overheating: `<strong>Component Overheating</strong><br><br>
    <ul>
		<li>Check that the current is within component limits.</li>
		<li>Verify the component value is correct.</li>
		<li>Look for short circuits or reversed polarity.</li>
		<li>Compare power dissipation with the rating.</li>
		<li>Stop the test if the part discolors, smells, or becomes too hot.</li>
    </ul>`,

		viva_prep: `<strong>Viva Preparation</strong><br><br>
    <ul>
		<li>Know the objective, theory, and key formulas.</li>
		<li>Be able to explain every instrument you used.</li>
		<li>Know the main sources of error and their effect on results.</li>
		<li>Practice a one-minute summary of the experiment.</li>
		<li>Review the safety points before entering the lab.</li>
    </ul>`,

		conclusion_writing: `<strong>Conclusion Writing</strong><br><br>
    <ul>
		<li>State the main result in one or two sentences.</li>
		<li>Say whether the aim was achieved.</li>
		<li>Refer to the key numbers or graphs, not just opinions.</li>
		<li>Mention the largest source of error.</li>
		<li>Keep the conclusion short and direct.</li>
    </ul>`,
		op_amp: `<strong>Operational Amplifiers (Op-Amps)</strong><br><br>
    An op-amp is a high-gain differential amplifier used for signal conditioning and computation.<br><br>
    <strong>Ideal assumptions:</strong><br>
    • Infinite open-loop gain<br>
    • Infinite input impedance<br>
    • Zero output impedance<br>
    • Virtual short between inputs (under negative feedback)<br><br>
    <strong>Inverting amplifier:</strong> Av = -Rf/Rin (180° phase shift)<br>
    <strong>Non-inverting amplifier:</strong> Av = 1 + Rf/Rg (in phase)<br><br>
    <strong>Common uses:</strong> Amplifiers, comparators, active filters, oscillators, summing and difference circuits.`,

		'555 timer': `<strong>555 Timer IC</strong><br><br>
    A versatile IC used to generate precise time delays or oscillations.<br><br>
    <strong>Astable mode:</strong> Free-running oscillator<br>
    • Frequency: f = 1.44 / ((Ra + 2Rb) × C)<br>
    • Duty cycle: D = (Ra + Rb) / (Ra + 2Rb)<br><br>
    <strong>Monostable mode:</strong> One-shot pulse generator<br>
    • Pulse width: t = 1.1 × R × C<br><br>
    <strong>Pin functions:</strong> Trigger, Threshold, Discharge, Reset, Control Voltage, Output.<br><br>
    <em class="warn">⚠ Check IC pin orientation before powering — reversed power can destroy the chip.</em>`,

		refraction: `<strong>Refraction & Snell's Law</strong><br><br>
    Refraction is the bending of light as it passes between media of different optical density.<br><br>
    <strong>Snell's Law:</strong> n1 sin(θ1) = n2 sin(θ2)<br><br>
    <strong>Refractive index:</strong> n = sin(i)/sin(r) = c/v<br><br>
    <strong>Key points:</strong><br>
    • Light bends toward the normal entering a denser medium<br>
    • Light bends away from the normal entering a less dense medium<br>
    • Total internal reflection occurs above the critical angle<br><br>
    <strong>Critical angle:</strong> sin(θc) = n2/n1 (for n1 &gt; n2)`,
	};

	function query(input) {
		const normalizedInput = normalizeSearchText(input);
		for (const key in knowledge) {
			if (normalizedInput.includes(normalizeSearchText(key)))
				return knowledge[key];
		}
		return null;
	}

	function getAllTopics() {
		return Object.keys(knowledge);
	}

	return { query, getAllTopics };
})();

/* ══════════════════════════════════════════════
   MODULE: SAFETY
══════════════════════════════════════════════ */
const SafetyModule = (() => {
	const safetyData = {
		chemical: {
			icon: '☣',
			title: 'Chemical Safety',
			content: `
        <h4>⚠ General Rules</h4>
        <ul>
			<li class="danger">NEVER pipette by mouth.</li>
			<li>Read the Safety Data Sheet (SDS) before using any chemical.</li>
			<li>Always label all containers clearly.</li>
			<li>Never eat, drink, or apply cosmetics in the lab.</li>
        </ul>
        <h4>Acids & Bases</h4>
        <ul>
			<li class="danger">Always add ACID to WATER — never the reverse.</li>
			<li>Handle concentrated acids (H₂SO₄, HCl, HNO₃) only in a fume hood.</li>
			<li>Neutralize spills with sodium bicarbonate (for acids).</li>
        </ul>
        <h4>Storage</h4>
        <ul>
			<li>Segregate incompatible chemicals (oxidizers from flammables).</li>
			<li>Store flammables away from heat sources in approved cabinets.</li>
			<li>Keep volatile solvents in sealed containers.</li>
        </ul>
        <h4>Emergency Response — Chemical Splash</h4>
        <ul>
			<li>Immediately flush with running water for 15–20 minutes.</li>
			<li>Remove contaminated clothing.</li>
			<li>Seek medical attention immediately.</li>
        </ul>`,
		},

		electrical: {
			icon: '⚡',
			title: 'Electrical Safety',
			content: `
        <h4>⚠ Golden Rules</h4>
        <ul>
			<li class="danger">Treat all conductors as live until proven otherwise.</li>
			<li>Always use one hand when working near live circuits.</li>
			<li>Use insulated tools rated for the voltage.</li>
			<li>Never work alone on live high-voltage equipment.</li>
        </ul>
        <h4>Before Starting</h4>
        <ul>
			<li>Lock Out / Tag Out (LOTO) all energy sources.</li>
			<li>Verify zero voltage with an approved meter.</li>
			<li>Discharge capacitors before touching.</li>
			<li>Inspect insulation on all cables — replace if damaged.</li>
        </ul>
        <h4>Working Safely</h4>
        <ul>
			<li>Use GFCIs (Ground Fault Circuit Interrupters).</li>
			<li>Keep work area dry — water and electricity are lethal.</li>
			<li>Use appropriate PPE: insulated gloves, safety glasses.</li>
			<li>Avoid loose clothing near rotating electrical machinery.</li>
        </ul>
        <h4>Emergency — Electrical Accident</h4>
        <ul>
			<li class="danger">DO NOT touch the victim — de-energize first!</li>
			<li>Switch off power or use non-conducting object to move them.</li>
			<li>Call emergency services immediately.</li>
			<li>Begin CPR if victim is unresponsive and not breathing.</li>
        </ul>`,
		},

		mechanical: {
			icon: '⚙',
			title: 'Mechanical Safety',
			content: `
        <h4>⚠ Key Precautions</h4>
        <ul>
			<li>Never reach into moving machinery.</li>
			<li>Ensure all guards and covers are in place before starting equipment.</li>
			<li>Secure workpieces properly before machining.</li>
        </ul>
        <h4>Rotating Equipment</h4>
        <ul>
			<li class="danger">Never wear loose clothing, ties, or jewellery near lathes, drills, or motors.</li>
			<li>Tie back long hair securely.</li>
			<li>Always stop the machine before making adjustments.</li>
		</ul>
        <h4>Hand Tools</h4>
        <ul>
			<li>Use the correct tool for each job.</li>
			<li>Inspect tools before use — report damaged tools.</li>
			<li>Keep cutting tools sharp — dull tools require more force and slip.</li>
        </ul>
        <h4>Heavy Loads</h4>
        <ul>
			<li>Use mechanical aids (hoists, trolleys) for heavy equipment.</li>
			<li>Bend knees and keep back straight when lifting.</li>
			<li>Get assistance for loads over 25 kg.</li>
        </ul>`,
		},

		glass: {
			icon: 'GL',
			title: 'Broken Glass Safety',
			content: `
        <h4>Handling</h4>
        <ul>
			<li>Keep hands away from shards and clear the area.</li>
			<li>Use a brush and dustpan or forceps, never bare hands.</li>
			<li>Place fragments in the designated broken-glass container.</li>
        </ul>
        <h4>If Cut</h4>
        <ul>
			<li>Rinse the wound, apply pressure, and report the injury.</li>
			<li>Seek medical help if the cut is deep or contaminated.</li>
        </ul>`,
		},

		emergency: {
			icon: '🚨',
			title: 'Emergency Procedures',
			content: `
        <h4 class="danger">🔥 Fire</h4>
        <ul>
			<li>Activate the fire alarm immediately.</li>
			<li>Evacuate — do not use lifts.</li>
			<li>Only attempt to extinguish a small fire if trained to do so.</li>
			<li>Use correct extinguisher: CO₂ for electrical, powder for chemical, water for paper/wood.</li>
			<li>Meet at designated assembly point.</li>
        </ul>
        <h4 class="danger">☣ Chemical Spill</h4>
        <ul>
			<li>Alert others and evacuate the area if a large spill occurs.</li>
			<li>Use spill kit for small, known, low-hazard spills.</li>
			<li>Never clean up unknown chemicals without guidance.</li>
			<li>Report all spills to the laboratory supervisor.</li>
        </ul>
        <h4 class="danger">⚡ Electrical Accident</h4>
        <ul>
			<li class="danger">Switch off power FIRST. Do NOT touch the victim.</li>
			<li>Call emergency services immediately (999 / 112 / 911).</li>
			<li>Administer first aid — CPR if unresponsive.</li>
        </ul>
        <h4>General Emergency Numbers</h4>
        <ul>
			<li>Emergency Services: 999 / 112 / 911</li>
			<li>Poison Control: Contact your regional center</li>
			<li>Laboratory Supervisor on duty</li>
        </ul>`,
		},

		ppe: {
			icon: '🥽',
			title: 'PPE Recommendations',
			content: `
        <h4>Minimum Lab Requirements (ALL experiments)</h4>
        <ul>
			<li>✅ Safety glasses or goggles</li>
			<li>✅ Closed-toe shoes (no sandals)</li>
			<li>✅ Long trousers (no shorts)</li>
			<li>✅ Lab coat or protective clothing</li>
        </ul>
        <h4>Chemical Work</h4>
        <ul>
          <li>Chemical-resistant gloves (nitrile/neoprene based on chemical)</li>
          <li>Chemical splash goggles (not just safety glasses)</li>
          <li>Full face shield when handling concentrated acids</li>
          <li>Fume hood for volatile substances</li>
        </ul>
        <h4>Electrical Work</h4>
        <ul>
          <li>Insulated rubber gloves (rated for voltage level)</li>
          <li>Arc flash face shield for high-voltage work</li>
          <li>Insulated footwear</li>
          <li>No conductive jewellery or metallic accessories</li>
        </ul>
        <h4>Mechanical/Workshop</h4>
        <ul>
          <li>Anti-impact safety glasses</li>
          <li>Steel-capped boots</li>
          <li>Ear defenders near loud machinery (&gt;85 dB)</li>
          <li>Anti-vibration gloves for power tools</li>
        </ul>`,
		},

		fire: {
			icon: '🔥',
			title: 'Fire Safety',
			content: `
        <h4>Prevention</h4>
        <ul>
          <li>Store flammable liquids in approved flame-proof cabinets.</li>
          <li>Keep flammable materials away from open flames and heat sources.</li>
          <li>Ensure adequate ventilation when using volatile solvents.</li>
          <li>Never leave heating experiments unattended.</li>
        </ul>
        <h4>Fire Extinguisher Types</h4>
        <ul>
          <li><strong>CO₂ (black):</strong> Electrical fires — NEVER use water on electrical fires!</li>
          <li><strong>Powder (blue):</strong> Chemical/flammable liquid fires (Class B)</li>
          <li><strong>Water (red):</strong> Paper, wood, textile fires only (Class A)</li>
          <li><strong>Foam (cream):</strong> Flammable liquids</li>
        </ul>
        <h4>PASS Technique (Extinguisher Use)</h4>
        <ul>
          <li><strong>P</strong>ull the pin</li>
          <li><strong>A</strong>im at the base of the fire</li>
          <li><strong>S</strong>queeze the handle</li>
          <li><strong>S</strong>weep side to side</li>
        </ul>
        <h4 class="danger">Evacuation</h4>
        <ul>
          <li>Leave immediately — do NOT collect personal items.</li>
          <li>Close doors behind you to contain spread.</li>
          <li>Use stairs, never lifts.</li>
          <li>Report to assembly point and account for all personnel.</li>
        </ul>`,
		},
	};

	function getData(type) {
		return safetyData[type] || null;
	}

	function queryText(input) {
		const lower = input.toLowerCase();
		if (
			lower.includes('broken glass') ||
			lower.includes('glass shard') ||
			lower.includes('shards')
		)
			return safetyData.glass;
		if (
			lower.includes('electrical shock') ||
			lower.includes('electric shock') ||
			lower.includes('electrocution')
		)
			return safetyData.emergency;
		if (lower.includes('chemical spill') || lower.includes('chemical splash'))
			return safetyData.emergency;
		if (lower.includes('fume hood')) return safetyData.chemical;
		if (lower.includes('ppe') || lower.includes('protective'))
			return safetyData.ppe;
		if (lower.includes('electrical') && lower.includes('accident'))
			return safetyData.emergency;
		if (
			lower.includes('chemical') ||
			lower.includes('acid') ||
			lower.includes('base') ||
			lower.includes('sulfuric')
		)
			return safetyData.chemical;
		if (
			lower.includes('electrical') ||
			lower.includes('circuit') ||
			lower.includes('voltage') ||
			lower.includes('live')
		)
			return safetyData.electrical;
		if (
			lower.includes('fire') ||
			lower.includes('flammable') ||
			lower.includes('extinguisher')
		)
			return safetyData.fire;
		if (
			lower.includes('emergency') ||
			lower.includes('accident') ||
			lower.includes('spill')
		)
			return safetyData.emergency;
		if (
			lower.includes('mechanic') ||
			lower.includes('machine') ||
			lower.includes('rotating')
		)
			return safetyData.mechanical;
		return null;
	}

	return { getData, queryText };
})();

/* ══════════════════════════════════════════════
   MODULE: EXPERIMENTS
══════════════════════════════════════════════ */
const ExperimentsModule = (() => {
	const experiments = [
		{
			id: 1,
			category: 'electrical',
			title: 'Transformer Characteristics',
			desc: 'Investigate the voltage, current, and turns ratio relationships of a single-phase transformer.',
			difficulty: 'medium',
			time: '90 min',
			objective:
				'Determine the turns ratio, voltage transformation ratio, efficiency, and regulation of a single-phase transformer.',
			equipment: [
				'Single-phase transformer (220/110V)',
				'Variac (autotransformer)',
				'AC voltmeter (×2)',
				'AC ammeter (×2)',
				'Variable resistive load',
				'Wattmeter',
				'Connecting cables',
			],
			safety: [
				'Ensure supply is off before making connections.',
				'Do not exceed rated primary voltage.',
				'Never open-circuit the secondary with primary energized under load.',
				'Keep hands clear of live terminals.',
			],
			procedure: [
				'Identify primary and secondary terminals of the transformer.',
				'Connect the primary to the variac output through an ammeter and wattmeter.',
				'Connect an AC voltmeter across the primary terminals.',
				'Connect a voltmeter and ammeter on the secondary side with the variable load.',
				'Power on and gradually increase variac to rated primary voltage.',
				'Record: Vp, Vs, Ip, Is at no-load, 25%, 50%, 75%, 100% load.',
				'Calculate turns ratio: a = Np/Ns = Vp/Vs',
				'Calculate efficiency: η = (Pout/Pin) × 100%',
				'Calculate voltage regulation: VR = (Vno-load - Vfull-load)/Vfull-load × 100%',
			],
			results:
				'Turns ratio should match nameplate rating. Efficiency typically 95–98% at rated load. Regulation indicates voltage stability.',
		},
		{
			id: 2,
			category: 'electrical',
			title: 'DC Motor Speed-Torque Characteristics',
			desc: 'Study how load affects speed, torque, current, and efficiency of a DC shunt motor.',
			difficulty: 'hard',
			time: '120 min',
			objective:
				'Plot the speed-torque and efficiency-output power characteristics of a DC shunt motor.',
			equipment: [
				'DC shunt motor with DC generator (coupled)',
				'DC power supply (0–220V)',
				'Ammeter (×2)',
				'Voltmeter (×2)',
				'Tachometer',
				'Rheostat (field/armature)',
				'Loading resistor bank',
			],
			safety: [
				'Ensure field circuit is connected before energizing armature.',
				'Do not run motor at no-load for DC series motor.',
				'Mechanical guards must be in place.',
				'Wear safety glasses — rotating machinery hazard.',
			],
			procedure: [
				'Couple the DC motor shaft to the DC generator (load).',
				'Connect field rheostat to motor shunt field terminals.',
				'Connect armature supply through ammeter.',
				'Start motor using starter (reduce inrush current).',
				'Allow to reach rated speed at no-load.',
				'Gradually apply load in steps using generator load resistors.',
				'Record: Speed (RPM), Armature current (Ia), Terminal voltage, Load current, Load voltage at each step.',
				'Calculate torque: T = (V_load × I_load)/(ω) where ω = 2πN/60',
				'Plot Speed vs Torque and Efficiency vs Output Power curves.',
			],
			results:
				'Shunt motor should show relatively flat speed-torque curve. Efficiency peaks at 75–90% full load.',
		},
		{
			id: 3,
			category: 'electronics',
			title: 'Rectifier Circuits',
			desc: 'Build and analyze half-wave and full-wave bridge rectifiers; observe ripple voltage.',
			difficulty: 'easy',
			time: '60 min',
			objective:
				'Construct, test, and compare half-wave and full-wave bridge rectifier circuits.',
			equipment: [
				'Step-down transformer (9V secondary)',
				'Diodes (1N4007) ×4',
				'Capacitors (100μF, 1000μF)',
				'Resistors (1kΩ)',
				'Oscilloscope',
				'Multimeter',
				'Breadboard',
				'Connecting wires',
			],
			safety: [
				'Verify transformer is correctly rated.',
				'Connect capacitors with correct polarity (electrolytic).',
				'Power off before modifying circuit.',
			],
			procedure: [
				'Build half-wave rectifier: connect one diode in series with transformer secondary and load.',
				'Connect oscilloscope CH1 to transformer output; CH2 to rectifier output.',
				'Measure Vpeak, Vrms, and ripple frequency.',
				'Add filter capacitor (100μF) — observe ripple reduction.',
				'Build full-wave bridge rectifier using 4 diodes in bridge configuration.',
				'Observe waveform on oscilloscope — measure peak and average DC output.',
				'Replace 100μF cap with 1000μF — compare ripple voltage.',
				'Record all waveforms, calculate Vrms from oscilloscope readings.',
			],
			results:
				'Half-wave: Vdc ≈ 0.318Vm. Full-wave: Vdc ≈ 0.636Vm. Larger capacitor = lower ripple.',
		},
		{
			id: 4,
			category: 'electronics',
			title: 'BJT Transistor Amplifier',
			desc: 'Design and test a common-emitter BJT amplifier; measure voltage gain and frequency response.',
			difficulty: 'medium',
			time: '90 min',
			objective:
				'Construct a CE amplifier and measure DC biasing, voltage gain, and bandwidth.',
			equipment: [
				'BC547 NPN transistor',
				'Resistors (10kΩ, 2.2kΩ, 1kΩ, 470Ω)',
				'Capacitors (10μF ×2, 100μF)',
				'Oscilloscope',
				'Function generator',
				'DC power supply (12V)',
				'Multimeter',
				'Breadboard',
			],
			safety: [
				'Observe polarity of electrolytic capacitors.',
				'Do not exceed transistor power rating (Ptot < 500mW for BC547).',
				'Use current-limiting resistors to protect transistor.',
			],
			procedure: [
				'Build voltage-divider bias circuit: R1=10kΩ, R2=2.2kΩ connected to +12V.',
				'Connect BC547: Collector through Rc(2.2kΩ) to +12V; Emitter through Re(470Ω) to GND.',
				'Add bypass capacitor (100μF) across Re.',
				'Measure DC operating point: VB, VE, VC, IC.',
				'Verify transistor is in active region: VCE > 1V, IC = (VCC - VC)/Rc.',
				'Apply 1kHz sine wave (10mVpp) to base through coupling capacitor.',
				'Measure Vin and Vout on oscilloscope simultaneously.',
				'Calculate voltage gain: Av = Vout/Vin.',
				'Vary frequency from 100Hz to 1MHz — plot frequency response.',
			],
			results:
				'Expected gain Av ≈ -Rc/re where re = 26mV/IC. Typical gain: 20–50 for this circuit.',
		},
		{
			id: 5,
			category: 'physics',
			title: "Ohm's Law Verification",
			desc: "Experimentally verify Ohm's Law by measuring V-I characteristics of resistors.",
			difficulty: 'easy',
			time: '45 min',
			objective:
				'Verify that V = IR and determine the resistance from slope of V-I graph.',
			equipment: [
				'Resistors (100Ω, 220Ω, 470Ω)',
				'DC power supply (0–12V)',
				'Ammeter (mA range)',
				'Voltmeter (or multimeter)',
				'Rheostat',
				'Connecting leads',
			],
			safety: [
				'Start with minimum voltage, increase gradually.',
				'Do not exceed resistor power rating: P = V²/R.',
				'Check polarities before connecting ammeter.',
			],
			procedure: [
				'Connect 100Ω resistor in series with ammeter.',
				'Connect voltmeter directly across resistor.',
				'Set power supply to 0V, connect circuit.',
				'Increase voltage in steps: 1V, 2V, 3V, 4V, 5V, 6V, 7V, 8V, 9V, 10V.',
				'Record voltage and current at each step.',
				'Repeat with 220Ω and 470Ω resistors.',
				'Plot V (y-axis) vs I (x-axis) for each resistor.',
				'Calculate slope of each line — this equals resistance.',
				'Compare calculated resistance with nominal value, find % error.',
			],
			results:
				"Graph should be a straight line through origin. Slope = R. Linearity confirms Ohm's Law holds for resistors.",
		},
		{
			id: 6,
			category: 'physics',
			title: 'Simple Pendulum & Gravity',
			desc: 'Determine the acceleration due to gravity using a simple pendulum experiment.',
			difficulty: 'easy',
			time: '50 min',
			objective:
				'Measure the period of a pendulum for different lengths and calculate g.',
			equipment: [
				'String (1m+)',
				'Metal bob (50–100g)',
				'Ruler / measuring tape',
				'Stopwatch',
				'Protractor',
				'Clamp stand',
				'Graph paper',
			],
			safety: [
				'Ensure clamp stand is firmly secured.',
				'Keep oscillation angle below 15° for accurate results.',
				'Be careful of swinging pendulum.',
			],
			procedure: [
				'Set up pendulum: tie bob to string, clamp at top.',
				'Measure length L from pivot to center of bob.',
				'Displace bob to 10° and release (small angle approximation).',
				'Time 20 complete oscillations with stopwatch.',
				'Calculate period T = total time / 20.',
				'Repeat for lengths: 0.2m, 0.4m, 0.6m, 0.8m, 1.0m.',
				'Plot T² vs L — should give straight line through origin.',
				'Use slope: slope = 4π²/g → g = 4π²/slope.',
				'Compare with standard g = 9.81 m/s².',
			],
			results:
				'T = 2π√(L/g). Graph of T² vs L should be linear. Typical measurement gives g ≈ 9.7–9.85 m/s².',
		},
		{
			id: 7,
			category: 'chemistry',
			title: 'Acid-Base Titration',
			desc: 'Determine the concentration of HCl using standardized NaOH solution.',
			difficulty: 'medium',
			time: '75 min',
			objective:
				'Determine the unknown concentration of hydrochloric acid by titration with sodium hydroxide.',
			equipment: [
				'Burette (50mL)',
				'Pipette (25mL)',
				'Conical flask',
				'Stand and clamp',
				'Phenolphthalein indicator',
				'0.1M NaOH (standardized)',
				'Unknown HCl solution',
				'White tile',
				'Safety goggles, gloves, lab coat',
			],
			safety: [
				'Wear goggles, gloves, and lab coat throughout.',
				'Handle NaOH and HCl with care — corrosive.',
				'Wash hands thoroughly after experiment.',
				'Work near an emergency eyewash station.',
			],
			procedure: [
				'Rinse burette with distilled water then with NaOH solution.',
				'Fill burette with 0.1M NaOH; record initial volume.',
				'Rinse pipette with HCl solution; pipette 25.0mL HCl into conical flask.',
				'Add 2–3 drops of phenolphthalein indicator.',
				'Place flask on white tile under burette.',
				'Add NaOH slowly from burette, swirling continuously.',
				'Near endpoint, add NaOH drop-by-drop.',
				'Stop at permanent pink colour lasting 30 seconds.',
				'Record final burette reading; calculate volume of NaOH used.',
				'Repeat titration until 3 concordant results (within 0.10mL).',
				'Calculate: C(HCl) = C(NaOH) × V(NaOH) / V(HCl)',
			],
			results:
				'Concentration of HCl calculated from average concordant titre. Record to 4 significant figures.',
		},
		{
			id: 8,
			category: 'control',
			title: 'PID Controller Simulation',
			desc: "Analyze the effect of P, I, D gains on a control system's step response.",
			difficulty: 'hard',
			time: '120 min',
			objective:
				'Understand the effect of proportional, integral, and derivative gains on stability, rise time, and steady-state error.',
			equipment: [
				'PC with MATLAB/Simulink (or Python/SciPy)',
				'Control system toolbox',
				'Step response simulation setup',
				'Printed data sheets',
			],
			safety: [
				'No significant physical safety risk — simulation experiment.',
				'Ensure proper software licensing.',
			],
			procedure: [
				'Model a first-order plant: G(s) = 1/(s+1) or second-order G(s) = ωn²/(s²+2ζωns+ωn²).',
				'Implement P controller: vary Kp from 0.5 to 10, observe step response.',
				'Record rise time, overshoot, settling time, steady-state error for each Kp.',
				'Add Integral action: set Ki=1, vary Kp — observe SSE elimination.',
				'Observe integral windup effects with high Ki.',
				'Add Derivative action: set Kd=0.5 — observe overshoot reduction.',
				'Use Ziegler-Nichols method: increase Kp until sustained oscillation, record Ku and Tu.',
				'Apply ZN tuning rules: Kp=0.6Ku, Ti=0.5Tu, Td=0.125Tu.',
				'Compare Ziegler-Nichols vs manual tuning. Plot all step responses.',
			],
			results:
				'P: reduces SSE, may cause steady-state error. I: eliminates SSE. D: reduces overshoot and settling time. Optimal PID minimizes ITAE.',
		},
		{
			id: 9,
			category: 'electronics',
			title: 'RC Time Constant',
			desc: 'Measure the charging and discharging time constant of an RC circuit.',
			difficulty: 'easy',
			time: '55 min',
			objective:
				'Determine the time constant τ = RC experimentally and verify theory.',
			equipment: [
				'Resistors (10kΩ, 22kΩ)',
				'Capacitors (100μF, 47μF)',
				'DC power supply (9V)',
				'Oscilloscope',
				'Multimeter',
				'Switch',
				'Breadboard',
			],
			safety: [
				'Observe capacitor polarity.',
				'Discharge capacitors before circuit changes.',
			],
			procedure: [
				'Build series RC circuit: R=10kΩ, C=100μF.',
				'Connect oscilloscope across capacitor.',
				'Apply step voltage — observe exponential charging.',
				'Read time to reach 63.2% of Vsupply → this is τ = RC.',
				'Compare measured τ with theoretical: τ = RC = 10kΩ × 100μF = 1s.',
				'Switch supply off — observe exponential decay to 36.8% Vsupply.',
				'Repeat with R=22kΩ, C=47μF.',
				'Change to square wave input (f = 0.1/τ) and observe waveforms.',
			],
			results:
				'Measured τ should match RC product within ±10% (component tolerances). Charge curve: Vc = Vs(1-e^(-t/RC)).',
		},
		{
			id: 10,
			category: 'control',
			title: 'Temperature Control System',
			desc: 'Implement and test an ON/OFF and PID temperature controller on a thermal process.',
			difficulty: 'hard',
			time: '150 min',
			objective:
				'Compare ON/OFF and PID control strategies for temperature regulation.',
			equipment: [
				'Heating element (50–100W)',
				'Temperature sensor (PT100 or thermocouple)',
				'PID controller unit or microcontroller',
				'SSR (Solid State Relay)',
				'Thermocouple amplifier module',
				'Insulated test chamber',
			],
			safety: [
				'Heating element operates at mains voltage — use SSR for isolation.',
				'Ensure thermal overprotection is set.',
				'Allow system to cool before modifications.',
				'Never leave heating experiment unattended.',
			],
			procedure: [
				'Wire PT100 sensor to temperature amplifier input.',
				'Connect heater to SSR output; SSR control signal to controller output.',
				'Set setpoint to 50°C.',
				'Test ON/OFF control: observe oscillation around setpoint.',
				'Measure: oscillation amplitude and period.',
				'Switch to PID mode with default parameters.',
				'Apply step change in setpoint from 50°C to 70°C.',
				'Record temperature response: rise time, overshoot, settling time.',
				'Tune P, I, D manually or using auto-tune function.',
				'Compare ON/OFF vs PID stability and steady-state accuracy.',
			],
			results:
				'ON/OFF shows oscillation. PID achieves tight control. Well-tuned PID maintains ±0.5°C of setpoint.',
		},
		{
			id: 11,
			category: 'electrical',
			title: 'Three-Phase Power Measurement',
			desc: 'Measure three-phase power using the two-wattmeter method.',
			difficulty: 'hard',
			time: '100 min',
			objective:
				'Determine three-phase active, reactive, and apparent power using two-wattmeter method.',
			equipment: [
				'Three-phase supply (400V)',
				'Two single-phase wattmeters',
				'Voltmeter (AC)',
				'Ammeter (AC, ×3)',
				'Three-phase balanced load (motor or resistive bank)',
				'Power factor meter',
			],
			safety: [
				'Three-phase mains voltage — extreme caution!',
				'All connections must be made with supply OFF.',
				'Use insulated tools only.',
				'Ensure qualified supervision.',
			],
			procedure: [
				'Ensure supply is off; perform LOTO.',
				'Connect first wattmeter: current coil in line L1, voltage coil between L1 and L3.',
				'Connect second wattmeter: current coil in line L2, voltage coil between L2 and L3.',
				'Connect three-phase balanced load.',
				'Energize supply; record wattmeter readings W1 and W2.',
				'Calculate total power: P = W1 + W2.',
				'Calculate reactive power: Q = √3 × (W1 - W2).',
				'Calculate apparent power: S = √(P² + Q²).',
				'Calculate power factor: PF = cos φ = P/S.',
			],
			results:
				'For balanced resistive load: W1 ≈ W2. Inductive load: W2 < W1. Leading PF: W2 may be negative.',
		},
		{
			id: 12,
			category: 'chemistry',
			title: 'Electrochemistry — Electrolysis',
			desc: "Study the electrolysis of copper sulfate solution and Faraday's laws.",
			difficulty: 'medium',
			time: '90 min',
			objective:
				"Verify Faraday's First and Second Laws of Electrolysis using copper deposition.",
			equipment: [
				'CuSO₄ solution (0.5M)',
				'Copper electrodes (anode + cathode)',
				'DC power supply (3–6V)',
				'Ammeter',
				'Timer',
				'Analytical balance',
				'Sandpaper, acetone (electrode preparation)',
				'Safety goggles, gloves',
			],
			safety: [
				'Handle CuSO₄ with gloves — irritant.',
				'Keep power connections secure to avoid sparking.',
				'Dispose of solutions properly.',
			],
			procedure: [
				'Clean copper electrodes with sandpaper and acetone; dry thoroughly.',
				'Weigh both cathode and anode electrodes on analytical balance.',
				'Set up electrolytic cell: cathode (–) and anode (+) in CuSO₄ solution.',
				'Set current to 0.3A using power supply.',
				'Electrolyze for 30 minutes, recording current every 5 minutes.',
				'After 30 minutes, remove electrodes carefully, rinse with distilled water, dry.',
				'Reweigh both electrodes.',
				'Calculate mass deposited on cathode.',
				"Verify Faraday's First Law: m = (M×I×t)/(n×F) where F=96485 C/mol.",
				'Calculate theoretical mass and compare with experimental.',
			],
			results:
				'Copper deposited on cathode. Experimental mass should match theoretical within 2–5%. Mass lost at anode ≈ mass gained at cathode.',
		},
		{
			id: 13,
			category: 'physics',
			title: 'Wheatstone Bridge and Resistivity',
			desc: 'Use a balanced bridge to find an unknown resistance and estimate wire resistivity.',
			difficulty: 'medium',
			time: '75 min',
			objective:
				'Determine an unknown resistance and estimate the resistivity of a wire using the Wheatstone bridge.',
			equipment: [
				'Wheatstone bridge kit',
				'Galvanometer',
				'Decade resistance box',
				'Unknown resistor or resistance wire',
				'Meter rule',
				'Micrometer screw gauge',
				'Connecting leads',
				'Low-voltage DC supply',
			],
			safety: [
				'Keep the bridge supply at low voltage to protect the galvanometer.',
				'Make all connections with the supply switched off.',
				'Do not allow the resistance wire to overheat.',
			],
			procedure: [
				'Assemble the Wheatstone bridge with the known ratio arms and the unknown resistor.',
				'Close the circuit and adjust the variable arm until the galvanometer reads zero.',
				'Record the balance values and calculate the unknown resistance using Rx = (R2 / R1) * R3.',
				'Repeat the balance measurement for several wire lengths if estimating resistivity.',
				'Measure the wire diameter and compute cross-sectional area from the micrometer reading.',
				'Calculate resistivity using rho = R * A / L.',
			],
			results:
				'The bridge should balance at a null galvanometer reading. Calculated resistance should agree with the meter reading within a few percent.',
		},
		{
			id: 14,
			category: 'electronics',
			title: 'Diode V-I Characteristics',
			desc: 'Plot the forward and reverse current-voltage curve of a silicon diode.',
			difficulty: 'easy',
			time: '60 min',
			objective:
				'Measure the cut-in voltage of a silicon diode and observe reverse leakage current.',
			equipment: [
				'Silicon diode (1N4148 or 1N4007)',
				'Variable DC supply',
				'Series resistor (1kOhm)',
				'Ammeter',
				'Voltmeter',
				'Breadboard',
				'Connecting leads',
			],
			safety: [
				'Use a current-limiting resistor at all times.',
				'Do not exceed the diode reverse breakdown voltage.',
				'Check diode polarity before energizing the circuit.',
			],
			procedure: [
				'Build a series circuit with the diode, resistor, ammeter, and DC supply.',
				'Increase the forward bias voltage in small steps and record diode current and voltage.',
				'Plot the forward I-V curve and identify the knee voltage.',
				'Reverse the diode and repeat the measurement at low voltage.',
				'Observe the small reverse leakage current.',
				'Compare the curve with the expected silicon diode behavior.',
			],
			results:
				'Forward current rises rapidly after about 0.6 to 0.7 V. Reverse current remains very small until breakdown.',
		},
		{
			id: 15,
			category: 'electronics',
			title: 'RLC Series Resonance',
			desc: 'Observe resonance, bandwidth, and quality factor in a series RLC circuit.',
			difficulty: 'hard',
			time: '90 min',
			objective:
				'Measure the resonant frequency of a series RLC circuit and determine its bandwidth.',
			equipment: [
				'Resistor',
				'Inductor',
				'Capacitor',
				'Function generator',
				'Oscilloscope',
				'Multimeter',
				'Breadboard',
				'Connecting leads',
			],
			safety: [
				'Keep the signal amplitude low while sweeping frequency.',
				'Check the inductor temperature during the test.',
				'Discharge the capacitor before rewiring the circuit.',
			],
			procedure: [
				'Connect the resistor, inductor, and capacitor in series with the signal source.',
				'Sweep the input frequency through the expected resonance region.',
				'Measure the voltage across the resistor to infer circuit current.',
				'Identify the frequency where current is maximum and impedance is minimum.',
				'Calculate the theoretical resonance using f0 = 1 / (2 * pi * sqrt(LC)).',
				'Find the half-power points and compute bandwidth and Q factor.',
			],
			results:
				'At resonance, Xl equals Xc and the circuit current peaks. Lower resistance gives a narrower bandwidth and a higher Q factor.',
		},
		{
			id: 16,
			category: 'physics',
			title: 'Specific Heat Capacity by Calorimetry',
			desc: 'Determine the specific heat capacity of a metal sample using simple calorimetry.',
			difficulty: 'medium',
			time: '80 min',
			objective:
				'Calculate the specific heat capacity of a metal sample from thermal energy balance.',
			equipment: [
				'Metal sample',
				'Calorimeter or insulated cup',
				'Thermometer',
				'Balance',
				'Heater or hot water bath',
				'Stirrer',
				'Water',
				'Insulating gloves',
			],
			safety: [
				'Handle hot samples with tongs or heat-resistant gloves.',
				'Dry the sample before placing it on the balance.',
				'Avoid spills around electrical heaters.',
			],
			procedure: [
				'Measure the mass of the metal sample and the water in the calorimeter.',
				'Heat the metal sample to a known initial temperature.',
				'Transfer the hot metal into the calorimeter and stir gently.',
				'Record the final equilibrium temperature.',
				'Apply conservation of energy to calculate the sample specific heat.',
				'Compare the result with tabulated values for the metal.',
			],
			results:
				'The calculated specific heat should be close to the accepted value, typically within 5 to 10 percent.',
		},
		{
			id: 17,
			category: 'electrical',
			title: 'Induction Motor Slip Test',
			desc: 'Measure slip and speed-load behavior of a three-phase induction motor.',
			difficulty: 'medium',
			time: '90 min',
			objective:
				'Determine the slip, synchronous speed, and rotor speed of a three-phase induction motor under varying load.',
			equipment: [
				'Three-phase induction motor',
				'Three-phase AC supply',
				'Tachometer or stroboscope',
				'Loading arrangement (brake or generator)',
				'Ammeter (×3)',
				'Voltmeter',
				'Wattmeter',
			],
			safety: [
				'Ensure motor mounting is secure before starting.',
				'Keep clear of the rotating shaft and coupling.',
				'Do not exceed motor nameplate current.',
				'Use proper lockout before changing connections.',
			],
			procedure: [
				'Record the motor nameplate data: rated voltage, current, power, poles, frequency.',
				'Calculate synchronous speed: Ns = 120f/P.',
				'Start the motor at no load and measure no-load speed with a tachometer.',
				'Apply load in steps using the loading arrangement.',
				'Record speed, line current, and input power at each load step.',
				'Calculate slip: s = (Ns - Nr)/Ns × 100%.',
				'Plot slip versus load and speed versus load curves.',
			],
			results:
				'Slip increases with load while speed decreases slightly below synchronous speed. Slip is typically 2–5% at full load for standard induction motors.',
		},
		{
			id: 18,
			category: 'electronics',
			title: 'Op-Amp Inverting and Non-Inverting Amplifiers',
			desc: 'Build and test inverting and non-inverting op-amp configurations; verify gain equations.',
			difficulty: 'easy',
			time: '60 min',
			objective:
				'Construct inverting and non-inverting amplifier circuits using an op-amp and verify the theoretical gain equations.',
			equipment: [
				'LM741 or similar op-amp',
				'Resistors (1kΩ, 10kΩ, 100kΩ)',
				'Dual DC power supply (±12V)',
				'Function generator',
				'Oscilloscope',
				'Breadboard',
			],
			safety: [
				'Connect dual supply rails with correct polarity.',
				'Do not exceed op-amp supply voltage ratings.',
				'Power off before changing resistor values.',
			],
			procedure: [
				'Build an inverting amplifier: Rf=100kΩ, Rin=10kΩ, non-inverting input grounded.',
				'Apply a 1kHz sine wave (0.5Vpp) to the input.',
				'Measure Vin and Vout on the oscilloscope; verify the 180° phase shift.',
				'Calculate gain: Av = -Rf/Rin and compare with the measured Vout/Vin.',
				'Rebuild as a non-inverting amplifier: Rf=100kΩ, Rg=10kΩ.',
				'Repeat the measurement and calculate Av = 1 + Rf/Rg.',
				'Compare measured and theoretical gains for both configurations.',
			],
			results:
				'Inverting gain ≈ -Rf/Rin with a 180° phase shift. Non-inverting gain ≈ 1 + Rf/Rg, in phase with the input.',
		},
		{
			id: 19,
			category: 'physics',
			title: "Young's Modulus by Beam Bending",
			desc: "Determine a beam's Young's modulus by measuring deflection under load.",
			difficulty: 'medium',
			time: '70 min',
			objective:
				"Determine the Young's modulus of a beam material using the simply-supported beam bending method.",
			equipment: [
				'Metal beam (known dimensions)',
				'Knife-edge supports',
				'Slotted weights',
				'Travelling microscope or dial gauge',
				'Vernier calipers',
				'Meter rule',
			],
			safety: [
				'Do not exceed the elastic limit of the beam.',
				'Secure weights to prevent them from falling.',
				'Handle the travelling microscope carefully.',
			],
			procedure: [
				'Measure the length, breadth, and thickness of the beam with vernier calipers.',
				'Set up the beam on knife-edge supports with a known span L.',
				'Record the initial reading of the microscope or dial gauge at the beam midpoint.',
				'Add weights in equal increments and record the deflection at each step.',
				'Remove the weights in the same steps and record deflection again.',
				'Plot load versus deflection — the graph should be linear.',
				"Calculate Young's modulus using E = (W L^3) / (4 b d^3 y) for a simply supported beam.",
			],
			results:
				"The load-deflection graph should be a straight line. The calculated Young's modulus should be close to the accepted value for the beam material.",
		},
		{
			id: 20,
			category: 'control',
			title: 'Open-Loop vs Closed-Loop Speed Control',
			desc: 'Compare open-loop and closed-loop control of DC motor speed under disturbance.',
			difficulty: 'medium',
			time: '90 min',
			objective:
				'Compare the speed regulation of a DC motor under open-loop and closed-loop feedback control when subjected to load disturbances.',
			equipment: [
				'DC motor',
				'Tachogenerator or encoder for speed feedback',
				'PWM motor driver',
				'Microcontroller or analog controller',
				'Variable load (brake/dynamometer)',
				'Power supply',
			],
			safety: [
				'Keep hands clear of the rotating shaft and coupling.',
				'Ensure the load brake is properly secured.',
				'Use a current-limited supply.',
			],
			procedure: [
				'Configure the motor driver in open-loop mode using a fixed PWM duty cycle.',
				'Record steady-state speed at no load.',
				'Apply load disturbance in steps and record the speed drop at each step.',
				'Switch to closed-loop mode using tachogenerator feedback and a P or PI controller.',
				'Repeat the same load steps and record the corrected speed.',
				'Compare the percentage speed drop between open-loop and closed-loop cases.',
				'Plot speed versus load for both control modes on the same graph.',
			],
			results:
				'Open-loop speed drops significantly with load. Closed-loop control maintains speed close to the setpoint despite load disturbances.',
		},
		{
			id: 21,
			category: 'chemistry',
			title: 'pH Determination Using Indicators and a pH Meter',
			desc: 'Measure the pH of various solutions using indicators and compare with a calibrated pH meter.',
			difficulty: 'easy',
			time: '50 min',
			objective:
				'Determine the pH of given solutions using indicator color charts and a calibrated pH meter, and compare the results.',
			equipment: [
				'pH meter with calibration buffers (pH 4, 7, 10)',
				'Universal indicator solution or paper',
				'Test tubes',
				'Sample solutions (vinegar, soap solution, tap water, etc.)',
				'Distilled water',
				'Safety goggles, gloves',
			],
			safety: [
				'Wear goggles and gloves when handling samples.',
				'Rinse the pH electrode with distilled water between samples.',
				'Handle the glass electrode carefully — it is fragile.',
			],
			procedure: [
				'Calibrate the pH meter using pH 4, 7, and 10 buffer solutions.',
				'Add a few drops of universal indicator to each sample and compare the color to the chart.',
				'Record the estimated pH from the indicator for each sample.',
				'Rinse the electrode and measure the actual pH of each sample with the pH meter.',
				'Tabulate indicator estimates versus meter readings for each sample.',
				'Discuss any discrepancies between the indicator and meter values.',
			],
			results:
				'Indicator estimates should be reasonably close to the meter readings, typically within about 0.5–1 pH unit.',
		},
		{
			id: 22,
			category: 'electronics',
			title: '555 Timer Astable Multivibrator',
			desc: 'Build a 555 timer astable circuit and measure frequency and duty cycle.',
			difficulty: 'easy',
			time: '55 min',
			objective:
				'Construct a 555 timer astable multivibrator and verify the theoretical frequency and duty cycle equations.',
			equipment: [
				'NE555 timer IC',
				'Resistors (1kΩ, 10kΩ)',
				'Capacitors (0.01μF, 10μF)',
				'DC power supply (5–12V)',
				'Oscilloscope',
				'Breadboard',
			],
			safety: [
				'Check IC pin orientation before powering the circuit.',
				'Do not exceed the IC supply voltage rating.',
				'Discharge timing capacitors before rewiring.',
			],
			procedure: [
				'Wire the 555 timer in astable mode with Ra, Rb, and a timing capacitor C.',
				'Connect the output (pin 3) to the oscilloscope.',
				'Power the circuit and observe the square wave output.',
				'Measure the high time, low time, and period of the waveform.',
				'Calculate frequency: f = 1.44/((Ra+2Rb)C) and duty cycle: D = (Ra+Rb)/(Ra+2Rb).',
				'Compare the measured frequency and duty cycle with the calculated values.',
				'Change Ra or Rb and observe the effect on frequency and duty cycle.',
			],
			results:
				'Measured frequency and duty cycle should closely match the calculated theoretical values within component tolerance.',
		},
		{
			id: 23,
			category: 'physics',
			title: "Refraction and Snell's Law",
			desc: 'Determine the refractive index of a glass block from angles of incidence and refraction.',
			difficulty: 'easy',
			time: '45 min',
			objective:
				"Verify Snell's Law and determine the refractive index of a glass block.",
			equipment: [
				'Rectangular glass block',
				'Ray box or laser pointer',
				'Protractor',
				'Plain paper',
				'Pins (if using the pin method)',
				'Pencil and ruler',
			],
			safety: [
				'Avoid pointing the laser or light source at eyes.',
				'Handle the glass block carefully to avoid chipping.',
			],
			procedure: [
				'Place the glass block on paper and trace its outline.',
				'Direct a light ray at a known angle of incidence onto one face of the block.',
				'Mark the path of the incident and emergent rays.',
				'Remove the block and draw the normal at the point of incidence.',
				'Measure the angle of incidence and angle of refraction with a protractor.',
				'Repeat for several different angles of incidence.',
				'Calculate the refractive index using n = sin(i)/sin(r) for each trial.',
				'Average the calculated refractive index values.',
			],
			results:
				"The refractive index should be approximately constant for all angles, consistent with Snell's Law (n ≈ 1.5 for typical glass).",
		},
		{
			id: 24,
			category: 'control',
			title: 'Root Locus and Bode Plot Analysis',
			desc: 'Analyze system stability using root locus and Bode plot techniques in simulation software.',
			difficulty: 'hard',
			time: '110 min',
			objective:
				'Use root locus and Bode plot analysis to evaluate the stability and frequency response of a feedback control system.',
			equipment: [
				'PC with MATLAB/Simulink or equivalent control software',
				'Control system toolbox',
				'Sample transfer function data sheets',
			],
			safety: [
				'No significant physical safety risk — simulation experiment.',
				'Save work frequently to avoid data loss.',
			],
			procedure: [
				'Define the open-loop transfer function G(s)H(s) of the system under study.',
				'Generate the root locus plot and identify the range of gain K for stability.',
				'Determine breakaway points and asymptotes on the root locus.',
				'Generate the Bode plot (magnitude and phase) for the open-loop system.',
				'Identify the gain margin and phase margin from the Bode plot.',
				'Adjust the gain K and observe changes in the stability margins.',
				'Compare conclusions from the root locus and Bode plot analysis.',
			],
			results:
				'The system is stable for gains where all root locus branches remain in the left half-plane and the gain/phase margins are positive.',
		},
	];

	function getAll() {
		return experiments;
	}
	function getByCategory(cat) {
		if (cat === 'all') return experiments;
		return experiments.filter((e) => e.category === cat);
	}
	function getById(id) {
		return experiments.find((e) => e.id === id);
	}

	function findByQuery(input) {
		const lower = input.toLowerCase();
		return experiments.find(
			(e) =>
				lower.includes(e.title.toLowerCase()) ||
				lower.includes(e.category) ||
				(lower.includes('transformer') && e.title.includes('Transformer')) ||
				(lower.includes('rectifier') && e.title.includes('Rectifier')) ||
				(lower.includes('titration') && e.title.includes('Titration')) ||
				(lower.includes('ohm') && e.title.includes('Ohm')) ||
				(lower.includes('pendulum') && e.title.includes('Pendulum')) ||
				(lower.includes('pid') && e.title.includes('PID')) ||
				(lower.includes('rc circuit') && e.title.includes('RC')) ||
				(lower.includes('wheatstone') && e.title.includes('Wheatstone')) ||
				(lower.includes('diode') && e.title.includes('Diode')) ||
				(lower.includes('resonance') && e.title.includes('Resonance')) ||
				(lower.includes('calorimetry') && e.title.includes('Calorimetry')) ||
				(lower.includes('specific heat') &&
					e.title.includes('Specific Heat')) ||
				(lower.includes('induction motor') &&
					e.title.includes('Induction Motor')) ||
				(lower.includes('op-amp') && e.title.includes('Op-Amp')) ||
				(lower.includes('young') && e.title.includes('Young')) ||
				((lower.includes('open-loop') || lower.includes('closed-loop')) &&
					e.title.includes('Open-Loop')) ||
				(lower.includes('ph determination') && e.title.includes('pH')) ||
				(lower.includes('555') && e.title.includes('555')) ||
				(lower.includes('refraction') && e.title.includes('Refraction')) ||
				(lower.includes('root locus') && e.title.includes('Root Locus')),
		);
	}
	return { getAll, getByCategory, getById, findByQuery };
})();

/* ══════════════════════════════════════════════
   MODULE: CALCULATIONS
══════════════════════════════════════════════ */
const CalculationsModule = (() => {
	// Unit conversion table — all values relative to SI unit
	const units = {
		// Voltage — SI: V
		V: { factor: 1, group: 'voltage', si: 'V' },
		mV: { factor: 1e-3, group: 'voltage', si: 'V' },
		uV: { factor: 1e-6, group: 'voltage', si: 'V' },
		kV: { factor: 1e3, group: 'voltage', si: 'V' },

		// Current — SI: A
		A: { factor: 1, group: 'current', si: 'A' },
		mA: { factor: 1e-3, group: 'current', si: 'A' },
		uA: { factor: 1e-6, group: 'current', si: 'A' },
		nA: { factor: 1e-9, group: 'current', si: 'A' },

		// Power — SI: W
		W: { factor: 1, group: 'power', si: 'W' },
		mW: { factor: 1e-3, group: 'power', si: 'W' },
		uW: { factor: 1e-6, group: 'power', si: 'W' },
		kW: { factor: 1e3, group: 'power', si: 'W' },

		// Resistance — SI: Ω
		Ohm: { factor: 1, group: 'resistance', si: 'Ω' },
		mOhm: { factor: 1e-3, group: 'resistance', si: 'Ω' },
		kOhm: { factor: 1e3, group: 'resistance', si: 'Ω' },
		MOhm: { factor: 1e6, group: 'resistance', si: 'Ω' },
		GOhm: { factor: 1e9, group: 'resistance', si: 'Ω' },

		// Frequency — SI: Hz
		Hz: { factor: 1, group: 'frequency', si: 'Hz' },
		kHz: { factor: 1e3, group: 'frequency', si: 'Hz' },
		MHz: { factor: 1e6, group: 'frequency', si: 'Hz' },
		GHz: { factor: 1e9, group: 'frequency', si: 'Hz' },

		// Capacitance — SI: F
		F: { factor: 1, group: 'capacitance', si: 'F' },
		mF: { factor: 1e-3, group: 'capacitance', si: 'F' },
		uF: { factor: 1e-6, group: 'capacitance', si: 'F' },
		nF: { factor: 1e-9, group: 'capacitance', si: 'F' },
		pF: { factor: 1e-12, group: 'capacitance', si: 'F' },
	};

	function convert(value, from, to) {
		const fromUnit = units[from],
			toUnit = units[to];
		if (!fromUnit || !toUnit) return null;
		if (fromUnit.group !== toUnit.group) return null;
		const si = value * fromUnit.factor;
		return si / toUnit.factor;
	}

	function formatNum(n) {
		if (!Number.isFinite(n)) return String(n);
		if (n === 0) return '0';
		if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(4) + ' × 10⁹';
		if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(4) + ' × 10⁶';
		if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(4) + ' × 10³';
		if (Math.abs(n) < 1e-9) return (n * 1e12).toFixed(4) + ' × 10⁻¹²';
		if (Math.abs(n) < 1e-6) return (n * 1e9).toFixed(4) + ' × 10⁻⁹';
		if (Math.abs(n) < 1e-3) return (n * 1e6).toFixed(4) + ' × 10⁻⁶';
		return parseFloat(n.toPrecision(6)).toString();
	}

	return { convert, formatNum };
})();

/* ══════════════════════════════════════════════
   MODULE: INTENT ROUTER
══════════════════════════════════════════════ */
const IntentRouter = (() => {
	const routes = [
		// Calculation intents
		{
			pattern:
				/calculat|compute|find|what.*(resistance|voltage|current|power|ohm)/i,
			intent: 'CALC_GUIDE',
		},
		{
			pattern:
				/convert|swap|unit converter|unit conversion|to (milli|kilo|mega|micro|nano|pico|giga)/i,
			intent: 'CONVERT_GUIDE',
		},
		// Safety intents
		{
			pattern:
				/safety|ppe|protect|hazard|danger|accident|emerg|first aid|spill|fire|wear|precaution|sulfuric|chemical|acid|base/i,
			intent: 'SAFETY',
		},
		// Experiment intents
		{
			pattern:
				/guide|walk|procedure|step|experiment|lab (for|on|about)|how to (do|run|set up)/i,
			intent: 'EXPERIMENT',
		},
		// Knowledge intents
		{
			pattern:
				/explain|what is|define|describe|tell me about|how does|how do|meaning/i,
			intent: 'KNOWLEDGE',
		},
		// Equipment
		{
			pattern:
				/multimeter|oscilloscope|power supply|ammeter|voltmeter|signal gen/i,
			intent: 'KNOWLEDGE',
		},
		// Greeting
		{
			pattern: /^(hi|hello|hey|hola|howdy|good (morning|afternoon|evening))/i,
			intent: 'GREET',
		},
		// Help
		{
			pattern: /help|what can you|capabilities|features|topics/i,
			intent: 'HELP',
		},
	];

	function classify(input) {
		for (const r of routes) {
			if (r.pattern.test(input)) return r.intent;
		}
		return 'KNOWLEDGE';
	}

	return { classify };
})();

/* ══════════════════════════════════════════════
   MODULE: ASSISTANT PROMPTS
══════════════════════════════════════════════ */
const AssistantPromptBank = [
	{
		title: 'Concepts',
		prompts: [
			{ label: "Ohm's Law", text: "Explain Ohm's Law" },
			{ label: 'Capacitance', text: 'What is capacitance?' },
			{ label: 'Inductance', text: 'Explain inductance' },
			{ label: 'Breadboard', text: 'Breadboard basics' },
			{ label: 'Function Gen', text: 'Function generator basics' },
			{ label: 'Oscilloscope', text: 'Oscilloscope basics' },
			{ label: 'Power Supply', text: 'Power supply basics' },
			{ label: 'AC vs DC', text: 'What is the difference between AC and DC?' },
			{ label: "Kirchhoff's Laws", text: "Explain Kirchhoff's laws" },
			{ label: 'Diodes', text: 'Explain diodes' },
			{ label: 'Transistors', text: 'Explain transistors' },
			{
				label: "Newton's Laws",
				text: "Explain force and Newton's laws of motion",
			},
			{ label: 'Waves', text: 'Explain waves' },
			{ label: 'Molarity', text: 'Explain molarity' },
			{ label: 'Op-Amp Basics', text: 'Explain op-amps' },
			{ label: '555 Timer', text: 'Explain the 555 timer IC' },
			{ label: 'Refraction', text: "Explain refraction and Snell's law" },
		],
	},
	{
		title: 'Experiments',
		prompts: [
			{
				label: 'Transformer',
				text: 'Guide me through a transformer experiment',
			},
			{ label: 'Rectifier', text: 'Guide me through a rectifier experiment' },
			{
				label: 'Wheatstone Bridge',
				text: 'Guide me through a Wheatstone bridge experiment',
			},
			{
				label: 'RLC Resonance',
				text: 'Guide me through an RLC resonance experiment',
			},
			{
				label: 'RC Circuit',
				text: 'Guide me through an RC circuit experiment',
			},
			{ label: 'Diode V-I', text: 'Guide me through a diode experiment' },
			{
				label: 'Pendulum',
				text: 'Guide me through a simple pendulum experiment',
			},
			{ label: 'PID Control', text: 'Guide me through a PID experiment' },
			{
				label: 'Induction Motor',
				text: 'Guide me through the Induction Motor Slip Test experiment',
			},
			{
				label: 'Op-Amp Amplifier',
				text: 'Guide me through an op-amp amplifier experiment',
			},
			{
				label: "Young's Modulus",
				text: "Guide me through the Young's Modulus experiment",
			},
			{
				label: 'Open vs Closed Loop',
				text: 'Guide me through the open-loop vs closed-loop speed control experiment',
			},
			{
				label: 'pH Determination',
				text: 'Guide me through the pH determination experiment',
			},
			{
				label: '555 Timer Circuit',
				text: 'Guide me through the 555 timer experiment',
			},
			{
				label: 'Refraction',
				text: "Guide me through the refraction and Snell's law experiment",
			},
			{
				label: 'Root Locus',
				text: 'Guide me through the root locus and Bode plot experiment',
			},
		],
	},
	{
		title: 'Calculators',
		prompts: [
			{ label: 'Power', text: 'Calculate power for 12V and 2A' },
			{
				label: 'Resistance',
				text: 'Find equivalent resistance for 100, 220, and 470 Ohm resistors',
			},
			{
				label: 'Cap Energy',
				text: 'Calculate capacitor energy for 0.01 F and 5 V',
			},
			{
				label: 'Resonance',
				text: 'Find resonance frequency for 10 mH and 100 uF',
			},
			{
				label: 'Percent Error',
				text: 'Calculate percent error for 102 and 100',
			},
			{
				label: 'Efficiency',
				text: 'Calculate efficiency for 180 W out and 200 W in',
			},
			{
				label: 'Voltage Divider',
				text: 'Calculate voltage divider for 12 V, 1000 Ohm, and 2000 Ohm',
			},
			{
				label: 'Current Divider',
				text: 'Calculate current divider for 4 A, 1000 Ohm, and 3000 Ohm',
			},
			{
				label: 'Power Factor',
				text: 'Calculate power factor from 480 W and 600 VA',
			},
			{
				label: 'Frequency / Period',
				text: 'Find frequency from period 0.02 s',
			},
			{
				label: 'Period / Frequency',
				text: 'Find period from frequency 50 Hz',
			},
		],
	},
	{
		title: 'Units',
		prompts: [
			{ label: 'V to mV', text: 'Convert 12 V to mV' },
			{ label: 'mA to A', text: 'Convert 500 mA to A' },
			{ label: 'Ohm to kOhm', text: 'Convert 2200 Ohm to kOhm' },
			{ label: 'uF to F', text: 'Convert 4700 uF to F' },
			{ label: 'kHz to Hz', text: 'Convert 2.5 kHz to Hz' },
			{ label: 'MOhm to Ohm', text: 'Convert 3.3 MOhm to Ohm' },
		],
	},
	{
		title: 'Study',
		prompts: [
			{ label: 'Pre-Lab', text: 'Pre lab checklist' },
			{ label: 'Report Outline', text: 'Lab report outline' },
			{ label: 'Data Table', text: 'Data table template' },
			{ label: 'Graphing', text: 'Graphing checklist' },
			{ label: 'Viva Prep', text: 'Viva prep' },
			{ label: 'Conclusion', text: 'Conclusion writing' },
		],
	},
	{
		title: 'Troubleshooting',
		prompts: [
			{ label: 'No Output', text: 'Troubleshoot no output' },
			{ label: 'Noise', text: 'Fix noisy readings' },
			{ label: 'Clipping', text: 'Oscilloscope clipping' },
			{ label: 'Overheating', text: 'Component overheating' },
		],
	},
	{
		title: 'Safety',
		prompts: [
			{ label: 'PPE Guide', text: 'What PPE should I wear in the lab?' },
			{ label: 'Fume Hood', text: 'Fume hood safety' },
			{ label: 'Broken Glass', text: 'Broken glass safety' },
			{ label: 'Shock Response', text: 'Electrical shock response' },
			{ label: 'Spill Response', text: 'Chemical spill response' },
			{ label: 'Extinguisher', text: 'Fire extinguisher guide' },
			{
				label: 'Electrical Safety',
				text: 'What are the electrical safety rules?',
			},
			{ label: 'Acid Handling', text: 'How do I handle sulfuric acid safely?' },
		],
	},
];

function escapeSingleQuotedJs(value) {
	return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function renderAssistantPromptBank() {
	const root = document.getElementById('assistantPromptLibrary');
	if (!root) return;

	root.innerHTML = AssistantPromptBank.map(
		(group) => `
			<div class="prompt-group">
				<span class="prompt-group-title">${group.title}</span>
				<div class="quick-prompts prompt-prompts">
					${group.prompts
						.map(
							(prompt) =>
								`<button type="button" class="quick-btn" onclick="sendQuick('${escapeSingleQuotedJs(prompt.text)}')">${prompt.label}</button>`,
						)
						.join('')}
				</div>
			</div>`,
	).join('');
}

/* ══════════════════════════════════════════════
	MODULE: CHAT
══════════════════════════════════════════════ */
const ChatModule = (() => {
	let messages = [];
	let currentExpId = null;

	function init() {
		messages = StorageModule.loadChat();
		if (messages.length > 0) renderHistory();
	}

	function renderHistory() {
		const welcome = document.querySelector('.chat-welcome');
		if (welcome) welcome.remove();
		messages.forEach((m) => renderMessage(m.role, m.content, false));
	}

	function renderMessage(role, html, save = true) {
		const chatWindow = document.getElementById('chatWindow');
		const welcome = chatWindow.querySelector('.chat-welcome');
		if (welcome) welcome.remove();

		const msg = document.createElement('div');
		msg.className = `message ${role}`;
		msg.innerHTML = `
			<div class="msg-avatar">${role === 'user' ? `<i class="fa-solid fa-user"></i>` : '<i class="fa-solid fa-robot"></i>'}</div>
			<div class="msg-bubble">${html}</div>`;
		chatWindow.appendChild(msg);
		chatWindow.scrollTop = chatWindow.scrollHeight;

		if (save) {
			messages.push({ role, content: html });
			StorageModule.saveChat(messages);
		}
	}

	function showTyping() {
		const chatWindow = document.getElementById('chatWindow');
		const div = document.createElement('div');
		div.className = 'message assistant typing-msg';
		div.innerHTML = `<div class="msg-avatar">⚗</div>
		<div class="msg-bubble"><div class="typing-indicator">
			<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
		</div></div>`;
		chatWindow.appendChild(div);
		chatWindow.scrollTop = chatWindow.scrollHeight;
		return div;
	}

	function removeTyping(el) {
		if (el && el.parentNode) el.remove();
	}

	function setStatus(state, text) {
		const dot = document.getElementById('statusDot');
		const txt = document.getElementById('statusText');
		if (!dot || !txt) return;
		dot.className = `status-dot ${state}`;
		txt.textContent = text;
	}

	async function processInput(input) {
		const trimmed = input.trim();
		if (!trimmed) return;
		renderMessage('user', trimmed);
		setStatus('thinking', 'Thinking…');
		const typingEl = showTyping();
		await delay(600 + Math.random() * 600);
		const response = generateResponse(trimmed);
		removeTyping(typingEl);
		renderMessage('assistant', response);
		setStatus('', 'Ready');
		SpeechModule.speak(stripHTML(response));
	}

	function generateResponse(input) {
		const intent = IntentRouter.classify(input);

		if (intent === 'GREET') {
			return `Welcome to Virtual Lab Assistant! 👋<br>
        I'm your AI-powered lab instructor. I can help you with:<br><br>
        • <strong>Explanations</strong>: circuits, physics, chemistry<br>
        • <strong>Experiment guidance</strong>: step-by-step procedures<br>
        • <strong>Safety advice</strong>: PPE, hazards, emergency procedures<br>
        • <strong>Calculations</strong>: Ohm's law, power, resistance networks, resonance, unit conversion<br><br>
        • <strong>Prompt bank</strong>: use the suggested buttons below for quick questions<br><br>
        What would you like to explore?`;
		}

		if (intent === 'HELP') {
			return `Here's what I can do:<br><br>
        🔬 <strong>Knowledge:</strong> "Explain inductance", "What is Ohm's law?"<br>
        🧪 <strong>Experiments:</strong> "Guide me through a transformer experiment", "Guide me through a Wheatstone bridge experiment"<br>
        ⚠️ <strong>Safety:</strong> "What PPE should I wear?", "What should I do for a chemical spill?"<br>
        🔢 <strong>Calculate:</strong> "Calculate power for 12V 2A", "Find equivalent resistance", "Find resonance frequency"<br>
        ⚙️ <strong>Equipment:</strong> "How to use a multimeter"<br><br>
        💡 <strong>Prompt bank:</strong> Use the buttons below for more experiment, calculator, and safety prompts.<br><br>
        Try asking anything related to electrical, electronics, physics, or chemistry!`;
		}

		if (intent === 'SAFETY') {
			const safetyData = SafetyModule.queryText(input);
			if (safetyData) {
				return `<strong>⚠ ${safetyData.title}</strong><br><br>${safetyData.content}`;
			}
			return `<strong>⚠ Safety Reminder</strong><br><br>
        Always observe these general lab rules:<br>
        • Wear appropriate PPE at all times (goggles, gloves, lab coat)<br>
        • Never work alone on hazardous experiments<br>
        • Know the location of emergency exits, eyewash stations, and fire extinguishers<br>
        • Read SDS sheets before using chemicals<br>
        • Report all accidents to the lab supervisor immediately<br><br>
        Ask me specifically: "Chemical safety", "Electrical safety", "What PPE should I wear?", "Emergency procedures"`;
		}

		if (intent === 'EXPERIMENT') {
			const exp = ExperimentsModule.findByQuery(input);
			if (exp) {
				currentExpId = exp.id;
				return formatExperimentResponse(exp);
			}
			return `I can guide you through these experiments:<br><br>
        ⚡ <strong>Electrical:</strong> Transformer characteristics, DC Motor, Three-phase power<br>
        📡 <strong>Electronics:</strong> Rectifiers, BJT Amplifier, RC Time Constant, Diode V-I, RLC Resonance<br>
        🔭 <strong>Physics:</strong> Ohm's Law verification, Simple Pendulum, Wheatstone Bridge, Calorimetry<br>
        🧪 <strong>Chemistry:</strong> Acid-base titration, Electrolysis<br>
        🎛 <strong>Control:</strong> PID Controller, Temperature Control<br><br>
        Try: "Guide me through a rectifier experiment" or "Transformer experiment"`;
		}

		if (intent === 'CALC_GUIDE') {
			return generateCalcResponse(input);
		}

		if (intent === 'CONVERT_GUIDE') {
			return generateConvertResponse(input);
		}

		// Default: knowledge lookup
		const kb = KnowledgeModule.query(input);
		if (kb) return kb;

		// Fallback for unknown query
		return `I can help with that topic! Could you be more specific?<br><br>
			Try asking about:<br>
			• <em>Ohm's Law, inductance, capacitance, resonance, transformers, motors</em><br>
			• <em>Kirchhoff's Laws, diodes, transistors, rectifiers</em><br>
			• <em>Oscilloscope, multimeter usage</em><br>
			• <em>Acids, bases, molarity, electrolysis</em><br>
			• <em>Force, energy, waves, calorimetry</em><br><br>
			Or ask for experiment guidance or safety information!`;
	}

	function formatExperimentResponse(exp) {
		let html = `<strong>🔬 ${exp.title}</strong><br>
			<span style="color:var(--cyan);font-size:0.78em;text-transform:uppercase;letter-spacing:0.1em">${exp.category}</span><br><br>
			<strong>Objective:</strong><br>${exp.objective}<br><br>
			<strong>Equipment required:</strong><br>`;
		exp.equipment.slice(0, 5).forEach((e) => {
			html += `• ${e}<br>`;
		});
		if (exp.equipment.length > 5)
			html += `• <em>...and ${exp.equipment.length - 5} more items</em><br>`;
		html += `<br><strong>⚠ Safety Notes:</strong><br>`;
		exp.safety.forEach((s) => {
			html += `<span class="warn">• ${s}</span><br>`;
		});
		html += `<br><strong>First 4 steps:</strong><br>`;
		exp.procedure.slice(0, 4).forEach((p, i) => {
			html += `<span class="step"><strong>${i + 1}.</strong> ${p}</span><br>`;
		});
		html += `<br><em>Click the experiment card in the Experiment Library for the full procedure, or ask "Show all steps for ${exp.title}"</em>`;
		return html;
	}

	function generateCalcResponse(input) {
		const nums =
			input.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number) || [];
		const lower = input.toLowerCase();

		if (
			lower.includes('series resistance') ||
			lower.includes('parallel resistance') ||
			lower.includes('equivalent resistance') ||
			lower.includes('resistor network') ||
			(lower.includes('series') && lower.includes('resistor')) ||
			(lower.includes('parallel') && lower.includes('resistor')) ||
			(lower.includes('series') && lower.includes('ohm')) ||
			(lower.includes('parallel') && lower.includes('ohm'))
		) {
			const values = nums.slice(0, 3).filter((n) => !isNaN(n));
			if (values.length < 2) {
				return `<strong>Resistance Network</strong><br><br>Enter at least two resistor values to calculate series or parallel equivalents.`;
			}
			const series = values.reduce((sum, value) => sum + value, 0);
			const parallel = values.some((value) => value === 0)
				? 0
				: 1 / values.reduce((sum, value) => sum + 1 / value, 0);
			return `<strong>Resistance Network</strong><br><br>
        Resistors: ${values
					.map((v) => `${CalculationsModule.formatNum(v)} Ohm`)
					.join(', ')}<br>
        Series: R_eq = R1 + R2${values.length === 3 ? ' + R3' : ''} = <strong>${CalculationsModule.formatNum(series)} Ohm</strong><br>
        Parallel: 1/R_eq = 1/R1 + 1/R2${values.length === 3 ? ' + 1/R3' : ''}<br>
        = <strong>${CalculationsModule.formatNum(parallel)} Ohm</strong>`;
		}

		if (
			lower.includes('capacitor energy') ||
			lower.includes('stored energy') ||
			(lower.includes('capacitor') &&
				(lower.includes('energy') || lower.includes('charge')))
		) {
			if (nums.length < 2) {
				return `<strong>Capacitor Energy</strong><br><br>Enter capacitance and voltage to calculate charge and stored energy.`;
			}
			const C = nums[0];
			const V = nums[1];
			const Q = C * V;
			const E = 0.5 * C * V * V;
			return `<strong>Capacitor Energy</strong><br><br>
        C = ${C} F, V = ${V} V<br>
        Charge: Q = C x V = <strong>${CalculationsModule.formatNum(Q)} C</strong><br>
        Energy: E = 1/2 C V^2 = <strong>${CalculationsModule.formatNum(E)} J</strong>`;
		}

		if (
			lower.includes('resonance') ||
			lower.includes('resonant') ||
			lower.includes('rlc')
		) {
			if (nums.length < 2) {
				return `<strong>Resonance Calculator</strong><br><br>Enter inductance and capacitance to calculate the resonant frequency.`;
			}
			const L = nums[0];
			const C = nums[1];
			const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
			const T = 1 / f0;
			return `<strong>Resonance Calculator</strong><br><br>
        L = ${L} H, C = ${C} F<br>
        f0 = 1/(2*pi*sqrt(LC)) = <strong>${CalculationsModule.formatNum(f0)} Hz</strong><br>
        Period: T = 1/f0 = <strong>${CalculationsModule.formatNum(T)} s</strong>`;
		}

		if (
			lower.includes('percent error') ||
			lower.includes('percentage error') ||
			lower.includes('% error')
		) {
			if (nums.length < 2) {
				return `<strong>Percent Error</strong><br><br>Enter measured and accepted values to calculate percent error.`;
			}
			const measured = nums[0];
			const accepted = nums[1];
			if (accepted === 0) {
				return `<strong>Percent Error</strong><br><br>The accepted value cannot be zero.`;
			}
			const error = (Math.abs(measured - accepted) / Math.abs(accepted)) * 100;
			return `<strong>Percent Error</strong><br><br>
        Measured = ${measured}<br>
        Accepted = ${accepted}<br>
        Percent error = |measured - accepted| / accepted x 100 = <strong>${CalculationsModule.formatNum(error)}%</strong>`;
		}

		if (lower.includes('efficien')) {
			if (nums.length < 2) {
				return `<strong>Efficiency</strong><br><br>Enter output power and input power to calculate efficiency.`;
			}
			const Pout = nums[0];
			const Pin = nums[1];
			if (Pin === 0) {
				return `<strong>Efficiency</strong><br><br>The input power cannot be zero.`;
			}
			const eta = (Pout / Pin) * 100;
			return `<strong>Efficiency</strong><br><br>
        Output power = ${Pout} W<br>
        Input power = ${Pin} W<br>
        η = Pout/Pin x 100 = <strong>${CalculationsModule.formatNum(eta)}%</strong><br>
        Losses = <strong>${CalculationsModule.formatNum(Pin - Pout)} W</strong>`;
		}

		if (lower.includes('frequency from period')) {
			if (!nums.length) {
				return `<strong>Frequency From Period</strong><br><br>Enter the period in seconds.`;
			}
			const T = nums[0];
			if (T === 0) {
				return `<strong>Frequency From Period</strong><br><br>The period cannot be zero.`;
			}
			const f = 1 / T;
			return `<strong>Frequency From Period</strong><br><br>
        Period = ${T} s<br>
        Frequency = 1/T = <strong>${CalculationsModule.formatNum(f)} Hz</strong>`;
		}

		if (lower.includes('period from frequency')) {
			if (!nums.length) {
				return `<strong>Period From Frequency</strong><br><br>Enter the frequency in hertz.`;
			}
			const f = nums[0];
			if (f === 0) {
				return `<strong>Period From Frequency</strong><br><br>The frequency cannot be zero.`;
			}
			const T = 1 / f;
			return `<strong>Period From Frequency</strong><br><br>
        Frequency = ${f} Hz<br>
        Period = 1/f = <strong>${CalculationsModule.formatNum(T)} s</strong>`;
		}

		if (lower.includes('voltage divider')) {
			if (nums.length < 3) {
				return `<strong>Voltage Divider</strong><br><br>Enter Vin, R1, and R2 to calculate Vout.`;
			}
			const Vin = nums[0];
			const R1 = nums[1];
			const R2 = nums[2];
			if (R1 + R2 === 0) {
				return `<strong>Voltage Divider</strong><br><br>The resistor sum cannot be zero.`;
			}
			const Vout = Vin * (R2 / (R1 + R2));
			const I = Vin / (R1 + R2);
			return `<strong>Voltage Divider</strong><br><br>
        Vin = ${Vin} V<br>
        R1 = ${R1} Ohm, R2 = ${R2} Ohm<br>
        Vout = Vin x R2/(R1 + R2) = <strong>${CalculationsModule.formatNum(Vout)} V</strong><br>
        Divider current = <strong>${CalculationsModule.formatNum(I)} A</strong>`;
		}

		if (lower.includes('current divider')) {
			if (nums.length < 3) {
				return `<strong>Current Divider</strong><br><br>Enter total current, R1, and R2 to calculate branch currents.`;
			}
			const Itotal = nums[0];
			const R1 = nums[1];
			const R2 = nums[2];
			if (R1 + R2 === 0) {
				return `<strong>Current Divider</strong><br><br>The resistor sum cannot be zero.`;
			}
			const I1 = Itotal * (R2 / (R1 + R2));
			const I2 = Itotal * (R1 / (R1 + R2));
			return `<strong>Current Divider</strong><br><br>
        Total current = ${Itotal} A<br>
        R1 = ${R1} Ohm, R2 = ${R2} Ohm<br>
        Current through R1 = Itotal x R2/(R1 + R2) = <strong>${CalculationsModule.formatNum(I1)} A</strong><br>
        Current through R2 = Itotal x R1/(R1 + R2) = <strong>${CalculationsModule.formatNum(I2)} A</strong>`;
		}

		if (lower.includes('power factor')) {
			if (nums.length < 2) {
				return `<strong>Power Factor</strong><br><br>Enter real power and apparent power to calculate power factor.`;
			}
			const P = nums[0];
			const S = nums[1];
			if (S === 0) {
				return `<strong>Power Factor</strong><br><br>The apparent power cannot be zero.`;
			}
			const pf = P / S;
			const phi = (Math.acos(Math.max(-1, Math.min(1, pf))) * 180) / Math.PI;
			return `<strong>Power Factor</strong><br><br>
        Real power = ${P} W<br>
        Apparent power = ${S} VA<br>
        PF = P/S = <strong>${CalculationsModule.formatNum(pf)}</strong><br>
        Phase angle = <strong>${CalculationsModule.formatNum(phi)} deg</strong>`;
		}

		if (
			lower.includes('ohm') ||
			(lower.includes('resistance') &&
				nums.length >= 2 &&
				!lower.includes('series') &&
				!lower.includes('parallel') &&
				!lower.includes('network'))
		) {
			if (nums.length >= 2) {
				const R = nums[0] / nums[1];
				return `<strong>Ohm's Law Calculation</strong><br><br>V = ${nums[0]}V, I = ${nums[1]}A<br>
				R = V/I = ${nums[0]}/${nums[1]} = <strong>${R.toFixed(4)} Ω</strong><br><br>
				Power: P = V×I = ${(nums[0] * nums[1]).toFixed(4)} W`;
			}
			return `<strong>Ohm's Law: V = I × R</strong><br><br>
				Use the Ohm's Law Calculator in the Tools section, or provide values:<br>
				Example: "Calculate resistance for 12V and 2A"<br><br>
				• R = V/I<br>• V = I×R<br>• I = V/R`;
		}

		if (lower.includes('power') && nums.length >= 2) {
			const P = nums[0] * nums[1];
			return `<strong>Power Calculation</strong><br><br>
        V = ${nums[0]}V, I = ${nums[1]}A<br>
        P = V × I = ${nums[0]} × ${nums[1]} = <strong>${P.toFixed(4)} W (${(P / 1000).toFixed(4)} kW)</strong><br><br>
        Also: P = V²/R = I²×R`;
		}
		return `<strong>Scientific Calculators Available:</strong><br><br>
			📐 <strong>Ohm's Law:</strong> V = IR — find V, I, or R<br>
			⚡ <strong>Power:</strong> P = VI — electrical power<br>
			〰 <strong>Voltage Divider:</strong> Vout = Vin × R2/(R1+R2)<br>
			🧪 <strong>Molarity:</strong> M = n/V<br>
			∿ <strong>Reactance:</strong> Xc = 1/(2πfC), Xl = 2πfL<br>
			🔗 <strong>Resistance Network:</strong> Series and parallel equivalents<br>
			🔋 <strong>Capacitor Energy:</strong> Q = CV, E = 1/2CV²<br>
			📡 <strong>Resonance:</strong> f0 = 1/(2π√LC)<br><br>
			Scroll to the <strong>Laboratory Tools</strong> section to use them, or provide specific values!`;
	}

	function generateConvertResponse(input) {
		const nums =
			input.match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi)?.map(Number) || [];
		const lower = input.toLowerCase();
		const hasToken = (token) =>
			new RegExp(`(^|[^a-z])${token}([^a-z]|$)`).test(lower);
		if (!nums.length) {
			return `<strong>Unit Conversion Examples:</strong><br><br>
        • 5 V = 5000 mV = 5000000 uV<br>
        • 0.5 A = 500 mA = 500000 uA = 500000000 nA<br>
        • 1000 W = 1 kW = 1000000 uW<br>
        • 220 Ohm = 0.22 kOhm = 220 mOhm = 0.00022 MOhm<br>
        • 1 GHz = 1000 MHz = 1000000 kHz<br>
        • 4700 uF = 4.7 mF = 4700000 nF<br><br>
        Use the <strong>Unit Converter</strong> in the Tools section for precise conversions!`;
		}

		const value = nums[0];
		let result = '';

		if (
			lower.includes('volt') ||
			hasToken('v') ||
			hasToken('mv') ||
			hasToken('uv') ||
			hasToken('kv')
		) {
			if (lower.includes('micro') || hasToken('uv'))
				result = `${value} V = <strong>${CalculationsModule.formatNum(
					value * 1000000,
				)} uV</strong>`;
			else if (lower.includes('milli') || hasToken('mv'))
				result = `${value} V = <strong>${CalculationsModule.formatNum(
					value * 1000,
				)} mV</strong>`;
			else if (lower.includes('kilo') || hasToken('kv'))
				result = `${value} V = <strong>${CalculationsModule.formatNum(
					value / 1000,
				)} kV</strong>`;
			else
				result = `${value} V = ${CalculationsModule.formatNum(
					value * 1000,
				)} mV = ${CalculationsModule.formatNum(
					value * 1000000,
				)} uV = ${CalculationsModule.formatNum(value / 1000)} kV`;
		} else if (
			lower.includes('amp') ||
			hasToken('a') ||
			hasToken('ma') ||
			hasToken('ua') ||
			hasToken('na')
		) {
			result = `${value} A = ${CalculationsModule.formatNum(
				value * 1000,
			)} mA = ${CalculationsModule.formatNum(
				value * 1000000,
			)} uA = ${CalculationsModule.formatNum(value * 1000000000)} nA`;
		} else if (
			lower.includes('watt') ||
			hasToken('w') ||
			hasToken('mw') ||
			hasToken('uw') ||
			hasToken('kw')
		) {
			result = `${value} W = ${CalculationsModule.formatNum(
				value * 1000,
			)} mW = ${CalculationsModule.formatNum(
				value * 1000000,
			)} uW = ${CalculationsModule.formatNum(value / 1000)} kW`;
		} else if (
			lower.includes('ohm') ||
			hasToken('ohm') ||
			hasToken('mohm') ||
			hasToken('kohm') ||
			hasToken('gohm')
		) {
			result = `${value} Ohm = ${CalculationsModule.formatNum(
				value * 1000,
			)} mOhm = ${CalculationsModule.formatNum(
				value / 1000,
			)} kOhm = ${CalculationsModule.formatNum(
				value / 1000000,
			)} MOhm = ${CalculationsModule.formatNum(value / 1000000000)} GOhm`;
		} else if (
			lower.includes('hz') ||
			lower.includes('frequency') ||
			hasToken('hz') ||
			hasToken('khz') ||
			hasToken('mhz') ||
			hasToken('ghz')
		) {
			result = `${value} Hz = ${CalculationsModule.formatNum(
				value / 1000,
			)} kHz = ${CalculationsModule.formatNum(
				value / 1000000,
			)} MHz = ${CalculationsModule.formatNum(value / 1000000000)} GHz`;
		} else if (
			lower.includes('farad') ||
			lower.includes('capacit') ||
			hasToken('f') ||
			hasToken('uf') ||
			hasToken('nf') ||
			hasToken('pf') ||
			hasToken('mf')
		) {
			result = `${value} F = ${CalculationsModule.formatNum(
				value * 1000,
			)} mF = ${CalculationsModule.formatNum(
				value * 1000000,
			)} uF = ${CalculationsModule.formatNum(
				value * 1000000000,
			)} nF = ${CalculationsModule.formatNum(value * 1000000000000)} pF`;
		} else {
			result = `Use the Unit Converter tool for precise conversions!`;
		}

		return `<strong>Unit Conversion</strong><br><br>${result}<br><br><em>Use the Unit Converter in Tools for all electrical and scientific unit conversions.</em>`;
	}

	function clear() {
		const chatWindow = document.getElementById('chatWindow');
		chatWindow.innerHTML = `
		<div class="chat-welcome">
						<div class="welcome-icon"><i class="fas fa-robot"></i></div>
						<p class="welcome-title">LabMate is ready.</p>
						<p class="welcome-hint">Do you want our prompt-library?</p>
						<div class="quick-prompts">
							<button class="quick-btn" id='promptLibraryToggleBtn' onclick="displayPromptLibrary()">
								Show Prompt Library
							</button>
						</div>
						<p class="welcome-hint">
							Or you can try:
							<em>"Guide me through a Wheatstone bridge experiment"</em> ·
						</p>
						<div class="quick-prompts">
							<button
								class="quick-btn"
								onclick="sendQuick('Explain inductance')">
								Inductance?
							</button>
							<button
								class="quick-btn"
								onclick="sendQuick('What PPE should I wear in the lab?')">
								PPE Guide
							</button>
							<button
								class="quick-btn"
								onclick="sendQuick('How to use a multimeter?')">
								Multimeter
							</button>
							<button
								class="quick-btn"
								onclick="
									sendQuick('Guide me through a transformer experiment')
								">
								Transformer Exp.
							</button>
						</div>
					</div>`;
		messages = [];
		StorageModule.clearChat();
		// renderAssistantPromptBank();
	}

	function export_() {
		const text = messages
			.map((m) => `[${m.role.toUpperCase()}]: ${stripHTML(m.content)}`)
			.join('\n\n');
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'vla-chat-export.txt';
		a.click();
		URL.revokeObjectURL(url);
	}

	function stripHTML(html) {
		return html
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function delay(ms) {
		return new Promise((res) => setTimeout(res, ms));
	}

	return { init, processInput, clear, export: export_ };
})();

/* ══════════════════════════════════════════════
	MODULE: SPEECH
══════════════════════════════════════════════ */
const SpeechModule = (() => {
	let recognition = null;
	let isListening = false;
	let synthesis = window.speechSynthesis;

	function init() {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			console.warn('Speech recognition not supported in this browser.');
			return;
		}
		recognition = new SpeechRecognition();
		recognition.continuous = false;
		recognition.interimResults = true;
		recognition.lang = 'en-US';

		recognition.onstart = () => {
			isListening = true;
			const btn = document.getElementById('voiceBtn');
			if (btn) btn.classList.add('active');
			setVoiceFeedback(
				`<i class="fa-solid fa-microphone" style="color: white;"></i> Listening…`,
			);
			setStatus('listening', 'Listening…');
		};

		recognition.onresult = (event) => {
			let interim = '',
				final = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) final += event.results[i][0].transcript;
				else interim += event.results[i][0].transcript;
			}
			const chatInput = document.getElementById('chatInput');
			if (chatInput) chatInput.value = final || interim;
			setVoiceFeedback(interim ? `Heard: "${interim}"` : '');
			if (final) {
				setVoiceFeedback(`✓ "${final}"`);
				setTimeout(() => {
					ChatModule.processInput(final);
					chatInput.value = '';
					setVoiceFeedback('');
				}, 300);
			}
		};
		recognition.onerror = (event) => {
			setVoiceFeedback(`Error: ${event.error}`);
			stopListening();
		};
		recognition.onend = () => {
			stopListening();
		};
	}

	function toggle() {
		if (!recognition) {
			alert(
				'Speech recognition is not supported in your browser.\nPlease use Chrome or Edge.',
			);
			return;
		}
		if (isListening) stopListening();
		else startListening();
	}

	function startListening() {
		try {
			recognition.start();
		} catch (e) {
			console.error(e);
		}
	}

	function stopListening() {
		isListening = false;
		const btn = document.getElementById('voiceBtn');
		if (btn) btn.classList.remove('active');
		setStatus('', 'Ready');
		try {
			if (recognition) recognition.stop();
		} catch (e) {}
	}

	function speak(text, rate = 1, pitch = 1) {
		if (!synthesis) return;
		synthesis.cancel();
		const cleanText = text.substring(0, 500); // limit length
		const utt = new SpeechSynthesisUtterance(cleanText);
		utt.rate = rate;
		utt.pitch = pitch;
		utt.volume = 0.95;
		// Try to select a clear voice
		const voices = synthesis.getVoices();
		const preferred = voices.find(
			(v) =>
				v.name.includes('Samantha') ||
				v.name.includes('Google') ||
				v.name.includes('Daniel'),
		);
		if (preferred) utt.voice = preferred;
		synthesis.speak(utt);
	}

	function setVoiceFeedback(text) {
		const el = document.getElementById('voiceFeedback');
		if (el) el.innerHTML = text;
	}

	function setStatus(state, text) {
		const dot = document.getElementById('statusDot');
		const txt = document.getElementById('statusText');
		if (!dot || !txt) return;
		dot.className = `status-dot ${state}`;
		txt.textContent = text;
	}

	return { init, toggle, speak };
})();

/* ══════════════════════════════════════════════
   MODULE: UI HELPERS
══════════════════════════════════════════════ */

// ── Calculator Functions ──
function calcOhm() {
	const V = parseFloat(document.getElementById('ohm-v').value);
	const I = parseFloat(document.getElementById('ohm-i').value);
	const R = parseFloat(document.getElementById('ohm-r').value);
	const res = document.getElementById('ohm-result');
	const filled = [!isNaN(V), !isNaN(I), !isNaN(R)].filter(Boolean).length;

	if (filled < 2) {
		res.textContent = '⚠ Enter at least two values.';
		return;
	}
	if (!isNaN(V) && !isNaN(I)) {
		res.innerHTML = `R = V/I = ${V}/${I} = <strong>${(V / I).toFixed(4)} Ω</strong> | P = ${(V * I).toFixed(4)} W`;
	} else if (!isNaN(V) && !isNaN(R)) {
		res.innerHTML = `I = V/R = ${V}/${R} = <strong>${(V / R).toFixed(4)} A</strong> | P = ${((V * V) / R).toFixed(4)} W`;
	} else if (!isNaN(I) && !isNaN(R)) {
		res.innerHTML = `V = I×R = ${I}×${R} = <strong>${(I * R).toFixed(4)} V</strong> | P = ${(I * I * R).toFixed(4)} W`;
	}
}

function calcPower() {
	const V = parseFloat(document.getElementById('pow-v').value);
	const I = parseFloat(document.getElementById('pow-i').value);
	const R = parseFloat(document.getElementById('pow-r').value);
	const res = document.getElementById('pow-result');

	if (!isNaN(V) && !isNaN(I)) {
		res.innerHTML = `P = V×I = ${V}×${I} = <strong>${(V * I).toFixed(4)} W</strong><br>
      = ${((V * I) / 1000).toFixed(6)} kW`;
	} else if (!isNaN(V) && !isNaN(R)) {
		res.innerHTML = `P = V²/R = ${V}²/${R} = <strong>${((V * V) / R).toFixed(4)} W</strong>`;
	} else if (!isNaN(I) && !isNaN(R)) {
		res.innerHTML = `P = I²×R = ${I}²×${R} = <strong>${(I * I * R).toFixed(4)} W</strong>`;
	} else {
		res.textContent =
			'⚠ Enter Voltage + Current, or Voltage + Resistance, or Current + Resistance.';
	}
}

function calcVoltageDivider() {
	const Vin = parseFloat(document.getElementById('vd-vin').value);
	const R1 = parseFloat(document.getElementById('vd-r1').value);
	const R2 = parseFloat(document.getElementById('vd-r2').value);
	const res = document.getElementById('vd-result');
	if (isNaN(Vin) || isNaN(R1) || isNaN(R2)) {
		res.textContent = '⚠ All fields required.';
		return;
	}
	const Vout = (Vin * R2) / (R1 + R2);
	const I = Vin / (R1 + R2);
	res.innerHTML = `Vout = Vin × R2/(R1+R2) = <strong>${Vout.toFixed(4)} V</strong><br>
    Current through divider: <strong>${(I * 1000).toFixed(4)} mA</strong>`;
}

function calcMolarity() {
	const n = parseFloat(document.getElementById('mol-n').value);
	const V = parseFloat(document.getElementById('mol-v').value);
	const M = parseFloat(document.getElementById('mol-m').value);
	const res = document.getElementById('mol-result');
	if (isNaN(n) || isNaN(V)) {
		res.textContent = '⚠ Moles and Volume required.';
		return;
	}
	const molarity = n / V;
	let extra = '';
	if (!isNaN(M))
		extra = `<br>Mass of solute: <strong>${(n * M).toFixed(4)} g</strong>`;
	res.innerHTML = `Molarity = n/V = ${n}/${V} = <strong>${molarity.toFixed(4)} mol/L (M)</strong>${extra}`;
}

function convertUnit() {
	const val = parseFloat(document.getElementById('conv-val').value);
	const from = document.getElementById('conv-from').value;
	const to = document.getElementById('conv-to').value;
	const res = document.getElementById('conv-result');
	if (isNaN(val)) {
		res.textContent = '⚠ Enter a value.';
		return;
	}

	const result = CalculationsModule.convert(val, from, to);
	if (result === null) {
		res.textContent = `⚠ Cannot convert ${from} to ${to} — different physical quantities.`;
	} else {
		res.innerHTML = `${val} ${from} = <strong>${CalculationsModule.formatNum(result)} ${to}</strong>`;
	}
}

function swapConverterUnits() {
	const from = document.getElementById('conv-from');
	const to = document.getElementById('conv-to');
	const res = document.getElementById('conv-result');
	if (!from || !to) return;
	[from.value, to.value] = [to.value, from.value];
	if (res) res.textContent = 'Unit selections swapped.';
}

function calcReactance() {
	const type = document.getElementById('react-type').value;
	const f = parseFloat(document.getElementById('react-f').value);
	const comp = parseFloat(document.getElementById('react-comp').value);
	const res = document.getElementById('react-result');
	if (isNaN(f) || isNaN(comp)) {
		res.textContent = '⚠ All fields required.';
		return;
	}

	if (type === 'cap') {
		const Xc = 1 / (2 * Math.PI * f * comp);
		res.innerHTML = `Xc = 1/(2πfC) = 1/(2π × ${f} × ${comp})<br>= <strong>${CalculationsModule.formatNum(Xc)} Ω</strong>`;
	} else {
		const Xl = 2 * Math.PI * f * comp;
		res.innerHTML = `Xl = 2πfL = 2π × ${f} × ${comp}<br>= <strong>${CalculationsModule.formatNum(Xl)} Ω</strong>`;
	}
}

function calcResistanceNetwork() {
	const mode = document.getElementById('res-mode').value;
	const R1 = parseFloat(document.getElementById('res-r1').value);
	const R2 = parseFloat(document.getElementById('res-r2').value);
	const R3 = parseFloat(document.getElementById('res-r3').value);
	const values = [R1, R2, R3].filter((n) => !isNaN(n));
	const res = document.getElementById('res-net-result');

	if (isNaN(R1) || isNaN(R2)) {
		res.textContent = '⚠ R1 and R2 are required.';
		return;
	}

	if (mode === 'series') {
		const eq = values.reduce((sum, value) => sum + value, 0);
		res.innerHTML = `Series: R_eq = R1 + R2${!isNaN(R3) ? ' + R3' : ''} = <strong>${CalculationsModule.formatNum(eq)} Ohm</strong>`;
		return;
	}

	if (values.some((value) => value === 0)) {
		res.innerHTML = `Parallel: one branch is 0 Ohm, so R_eq = <strong>0 Ohm</strong>`;
		return;
	}

	const eq = 1 / values.reduce((sum, value) => sum + 1 / value, 0);
	res.innerHTML = `Parallel: 1/R_eq = 1/R1 + 1/R2${!isNaN(R3) ? ' + 1/R3' : ''}<br>= <strong>${CalculationsModule.formatNum(eq)} Ohm</strong>`;
}

function calcCapacitorEnergy() {
	const C = parseFloat(document.getElementById('cap-c').value);
	const V = parseFloat(document.getElementById('cap-v').value);
	const res = document.getElementById('cap-energy-result');

	if (isNaN(C) || isNaN(V)) {
		res.textContent = '⚠ Capacitance and voltage are required.';
		return;
	}

	const Q = C * V;
	const E = 0.5 * C * V * V;
	res.innerHTML = `Charge: Q = C × V = <strong>${CalculationsModule.formatNum(Q)} C</strong><br>
    Energy: E = 1/2 C V^2 = <strong>${CalculationsModule.formatNum(E)} J</strong>`;
}

function calcResonance() {
	const L = parseFloat(document.getElementById('resonance-l').value);
	const C = parseFloat(document.getElementById('resonance-c').value);
	const res = document.getElementById('resonance-result');

	if (isNaN(L) || isNaN(C)) {
		res.textContent = '⚠ Inductance and capacitance are required.';
		return;
	}

	const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
	const T = 1 / f0;
	res.innerHTML = `f0 = 1/(2π√LC) = <strong>${CalculationsModule.formatNum(f0)} Hz</strong><br>
    Period: T = 1/f0 = <strong>${CalculationsModule.formatNum(T)} s</strong>`;
}

// Reactance type change label
document.addEventListener('DOMContentLoaded', () => {
	const typeSelect = document.getElementById('react-type');
	const label = document.getElementById('react-comp-label');
	if (typeSelect && label) {
		typeSelect.addEventListener('change', () => {
			label.textContent =
				typeSelect.value === 'cap' ? 'Capacitance (F)' : 'Inductance (H)';
		});
	}
});

// ── Safety Modal ──
let currentSafetyType = '';
function showSafetyModal(type) {
	const data = SafetyModule.getData(type);
	if (!data) return;
	currentSafetyType = type;
	document.getElementById('modalIcon').textContent = data.icon;
	document.getElementById('modalTitle').textContent = data.title;
	document.getElementById('modalContent').innerHTML = data.content;
	const modal = document.getElementById('safetyModal');
	modal.classList.add('open');
	document.body.style.overflow = 'hidden';
}

function closeSafetyModal(event) {
	if (
		event &&
		event.target !== document.getElementById('safetyModal') &&
		event.type === 'click'
	)
		return;
	document.getElementById('safetyModal').classList.remove('open');
	document.body.style.overflow = '';
}

function askAssistantSafety() {
	closeSafetyModal();
	scrollToAssistant();
	setTimeout(() => {
		document.getElementById('chatInput').value =
			`Tell me more about ${currentSafetyType} safety`;
		sendMessage();
	}, 500);
}

// ── Experiment Modal ──
let currentExpId = null;
function showExpModal(id) {
	const exp = ExperimentsModule.getById(id);
	if (!exp) return;
	currentExpId = id;

	const header = document.getElementById('expModalHeader');
	const content = document.getElementById('expModalContent');

	header.innerHTML = `
    <span class="exp-cat-tag">${exp.category.toUpperCase()}</span>
    <h2>${exp.title}</h2>
    <p style="color:var(--gray-mid);font-size:0.85rem;margin-top:0.5rem">${exp.desc}</p>
    <div style="display:flex;gap:1rem;margin-top:0.75rem">
		<span class="exp-difficulty ${exp.difficulty}">${exp.difficulty.toUpperCase()}</span>
		<span class="exp-time" style="font-size:0.8rem">⏱ ${exp.time}</span>
    </div>`;

	let html = `<h4 style="color:var(--cyan);font-family:var(--font-display);font-size:0.8rem;letter-spacing:0.1em;margin-bottom:0.75rem">OBJECTIVE</h4>
    <p style="color:var(--gray-light);font-size:0.88rem;margin-bottom:1.25rem">${exp.objective}</p>
    <h4 style="color:var(--cyan);font-family:var(--font-display);font-size:0.8rem;letter-spacing:0.1em;margin-bottom:0.75rem">EQUIPMENT</h4>
    <ul style="padding-left:1rem;color:var(--gray-light);font-size:0.85rem;margin-bottom:1.25rem">
		${exp.equipment.map((e) => `<li style="margin-bottom:0.3rem">${e}</li>`).join('')}
    </ul>
    <h4 style="color:var(--orange);font-family:var(--font-display);font-size:0.8rem;letter-spacing:0.1em;margin-bottom:0.75rem">⚠ SAFETY NOTES</h4>
    <ul style="padding-left:1rem;font-size:0.85rem;margin-bottom:1.25rem">
		${exp.safety.map((s) => `<li style="color:var(--orange);margin-bottom:0.3rem">${s}</li>`).join('')}
    </ul>
    <h4 style="color:var(--cyan);font-family:var(--font-display);font-size:0.8rem;letter-spacing:0.1em;margin-bottom:0.75rem">PROCEDURE</h4>`;
	exp.procedure.forEach((p, i) => {
		html += `<div class="exp-step"><span class="exp-step-num">${String(i + 1).padStart(2, '0')}</span><span class="exp-step-text">${p}</span></div>`;
	});
	html += `<h4 style="color:var(--green);font-family:var(--font-display);font-size:0.8rem;letter-spacing:0.1em;margin:1.25rem 0 0.75rem">EXPECTED RESULTS</h4>
    <p style="color:var(--gray-light);font-size:0.85rem">${exp.results}</p>`;

	content.innerHTML = html;
	document.getElementById('expModal').classList.add('open');
	document.body.style.overflow = 'hidden';
}

function closeExpModal(event) {
	if (
		event &&
		event.target !== document.getElementById('expModal') &&
		event.type === 'click'
	)
		return;
	document.getElementById('expModal').classList.remove('open');
	document.body.style.overflow = '';
}

function guideExperiment() {
	closeExpModal();
	if (!currentExpId) return;
	const exp = ExperimentsModule.getById(currentExpId);
	scrollToAssistant();
	setTimeout(() => {
		document.getElementById('chatInput').value =
			`Guide me through the ${exp.title} experiment`;
		sendMessage();
	}, 500);
}

// ── Experiment Grid ──
function renderExperiments(category = 'all') {
	const grid = document.getElementById('expGrid');
	if (!grid) return;
	const exps = ExperimentsModule.getByCategory(category);
	grid.innerHTML = exps
		.map(
			(e) => `
    <div class="exp-card" onclick="showExpModal(${e.id})">
		<span class="exp-cat-tag">${e.category}</span>
		<h3>${e.title}</h3>
		<p>${e.desc}</p>
		<div class="exp-card-footer">
        <span class="exp-difficulty ${e.difficulty}">${e.difficulty}</span>
        <span class="exp-time">⏱ ${e.time}</span>
	</div>	
    </div>`,
		)
		.join('');
}

// ── Category Filter ──
function initExpCategories() {
	document.querySelectorAll('.exp-cat').forEach((btn) => {
		btn.addEventListener('click', () => {
			document
				.querySelectorAll('.exp-cat')
				.forEach((b) => b.classList.remove('active'));
			btn.classList.add('active');
			renderExperiments(btn.dataset.cat);
		});
	});
}

/* ══════════════════════════════════════════════
   GLOBAL INTERFACE FUNCTIONS
══════════════════════════════════════════════ */
function sendMessage() {
	const input = document.getElementById('chatInput');
	const val = input.value.trim();
	if (!val) return;
	ChatModule.processInput(val);
	input.value = '';
	input.style.height = 'auto';
}

function sendQuick(text) {
	ChatModule.processInput(text);
}

function displayPromptLibrary() {
	const root = document.getElementById('assistantPromptLibrary');
	const btn = document.getElementById('promptLibraryToggleBtn');
	if (!root) return;

	const willOpen = !root.classList.contains('open');
	if (willOpen) {
		renderAssistantPromptBank();
		root.classList.add('open');
		root.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	} else {
		root.classList.remove('open');
	}
	if (btn)
		btn.textContent = willOpen ? 'Hide Prompt Library' : 'Show Prompt Library';
}

function clearChat() {
	ChatModule.clear();
}

function exportChat() {
	ChatModule.export();
}

function toggleVoice() {
	SpeechModule.toggle();
}

function scrollToAssistant() {
	document.getElementById('assistant').scrollIntoView({ behavior: 'smooth' });
}

function scrollToSection(section) {
	document.getElementById(section).scrollIntoView({ behavior: 'smooth' });
}

/* ══════════════════════════════════════════════
   MODULE: APP INIT
══════════════════════════════════════════════ */
(function initApp() {
	// Navbar scroll effect
	window.addEventListener('scroll', () => {
		const nav = document.getElementById('navbar');
		if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);

		// Active nav link
		const sections = ['home', 'experiments', 'safety', 'tools', 'assistant'];
		let current = '';
		sections.forEach((id) => {
			const sec = document.getElementById(id);
			if (sec && window.scrollY >= sec.offsetTop - 100) current = id;
		});
		document.querySelectorAll('.nav-link').forEach((link) => {
			link.classList.toggle(
				'active',
				link.getAttribute('href') === `#${current}`,
			);
		});
	});

	// Hamburger menu
	const hamburger = document.getElementById('hamburger');
	const navLinks = document.getElementById('navLinks');
	if (hamburger && navLinks) {
		hamburger.addEventListener('click', () => {
			hamburger.classList.toggle('open');
			navLinks.classList.toggle('open');
		});
		navLinks.querySelectorAll('.nav-link').forEach((link) => {
			link.addEventListener('click', () => {
				hamburger.classList.remove('open');
				navLinks.classList.remove('open');
			});
		});
	}

	// Chat input auto-resize
	const chatInput = document.getElementById('chatInput');
	if (chatInput) {
		chatInput.addEventListener('input', () => {
			chatInput.style.height = 'auto';
			chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
		});
		chatInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				sendMessage();
			}
		});
	}

	// Init modules
	ChatModule.init();
	renderAssistantPromptBank();
	SpeechModule.init();
	renderExperiments('all');
	initExpCategories();
	updateYear();

	// ESC closes modals
	document.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			closeSafetyModal(null);
			closeExpModal(null);
		}
	});

	// Fix ESC: create a null-safe version
	window.closeSafetyModal = (event) => {
		if (
			event &&
			event.type === 'click' &&
			event.target !== document.getElementById('safetyModal')
		)
			return;
		document.getElementById('safetyModal').classList.remove('open');
		document.body.style.overflow = '';
	};
	window.closeExpModal = (event) => {
		if (
			event &&
			event.type === 'click' &&
			event.target !== document.getElementById('expModal')
		)
			return;
		document.getElementById('expModal').classList.remove('open');
		document.body.style.overflow = '';
	};

	console.log('Virtual Lab Assistant — Initialized');
})();
