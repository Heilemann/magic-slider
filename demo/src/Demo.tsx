import React, { useState, useMemo } from 'react'
import { Slider } from '../../src'
import './index.css'

type ValueFormat = 'none' | 'percent' | 'currency' | 'decimal'

const ControlGroup = ({
	label,
	children,
	hint,
}: {
	label: string
	children: React.ReactNode
	hint?: string
}) => (
	<div className='space-y-1.5'>
		<div className='flex items-baseline justify-between'>
			<label className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
				{label}
			</label>
			{hint && <span className='text-[11px] text-gray-400 font-mono'>{hint}</span>}
		</div>
		{children}
	</div>
)

const Playground = () => {
	const [min, setMin] = useState(0)
	const [max, setMax] = useState(100)
	const [step, setStep] = useState(10)
	const [label, setLabel] = useState('')
	const [mode, setMode] = useState<'default' | 'tabs'>('default')
	const [handleSize, setHandleSize] = useState<'fixed' | 'proportional'>('proportional')
	const [showSteps, setShowSteps] = useState(true)
	const [useDiscreteValues, setUseDiscreteValues] = useState(false)
	const [discreteValues, setDiscreteValues] = useState('XS, S, M, L, XL')
	const [valueFormat, setValueFormat] = useState<ValueFormat>('none')
	const [previewValue, setPreviewValue] = useState<number | string>(50)

	const parsedDiscreteValues = useMemo(
		() =>
			discreteValues
				.split(',')
				.map(v => v.trim())
				.filter(v => v.length > 0),
		[discreteValues],
	)

	const handleModeChange = (newUseDiscrete: boolean) => {
		setUseDiscreteValues(newUseDiscrete)
		if (newUseDiscrete && parsedDiscreteValues.length > 0) {
			setPreviewValue(parsedDiscreteValues[0])
		} else {
			setPreviewValue(Math.round((min + max) / 2))
		}
	}

	const getRenderValue = () => {
		if (useDiscreteValues) return undefined
		switch (valueFormat) {
			case 'percent':
				return (v: number) => `${v}%`
			case 'currency':
				return (v: number) => `$${v.toFixed(2)}`
			case 'decimal':
				return (v: number) => v.toFixed(2)
			default:
				return undefined
		}
	}

	const stepCount = useDiscreteValues
		? parsedDiscreteValues.length
		: Math.round((max - min) / step) + 1

	const generatedCode = useMemo(() => {
		const props: string[] = []
		if (label) props.push(`label="${label}"`)
		if (useDiscreteValues) {
			props.push(`values={[${parsedDiscreteValues.map(v => `'${v}'`).join(', ')}]}`)
		} else {
			props.push(`min={${min}}`)
			props.push(`max={${max}}`)
			if (step !== 1) props.push(`step={${step}}`)
		}
		if (mode !== 'default') props.push(`mode="${mode}"`)
		if (handleSize !== 'fixed') props.push(`handleSize="${handleSize}"`)
		if (showSteps) props.push('showSteps')
		if (!useDiscreteValues && valueFormat !== 'none') {
			const fmt =
				valueFormat === 'percent'
					? '${v}%'
					: valueFormat === 'currency'
						? '$${v.toFixed(2)}'
						: '${v.toFixed(2)}'
			props.push(`renderValue={v => \`${fmt}\`}`)
		}

		if (props.length <= 2) {
			return `<Slider ${props.join(' ')} />`
		}
		return `<Slider\n  ${props.join('\n  ')}\n/>`
	}, [label, useDiscreteValues, parsedDiscreteValues, min, max, step, mode, handleSize, showSteps, valueFormat])

	return (
		<div className='flex min-h-[calc(100vh-4rem)]'>
			{/* Sidebar - fixed to left edge */}
			<aside className='w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto'>
				<div className='p-4 space-y-5'>
					<ControlGroup label='Type'>
						<Slider
							mode='tabs'
							values={['Continuous', 'Discrete']}
							value={useDiscreteValues ? 'Discrete' : 'Continuous'}
							onChange={v => handleModeChange(v === 'Discrete')}
						/>
					</ControlGroup>

					<div className='h-px bg-gray-200' />

					{useDiscreteValues ? (
						<>
							<ControlGroup label='Values' hint={`${parsedDiscreteValues.length}`}>
								<input
									type='text'
									value={discreteValues}
									onChange={e => {
										setDiscreteValues(e.target.value)
										const parsed = e.target.value
											.split(',')
											.map(v => v.trim())
											.filter(v => v)
										if (parsed.length > 0) setPreviewValue(parsed[0])
									}}
									className='w-full px-2.5 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
									placeholder='S, M, L, XL'
								/>
							</ControlGroup>

							<ControlGroup label='Display'>
								<Slider
									mode='tabs'
									values={['Standard', 'Tabs']}
									value={mode === 'tabs' ? 'Tabs' : 'Standard'}
									onChange={v => setMode(v === 'Tabs' ? 'tabs' : 'default')}
								/>
							</ControlGroup>
						</>
					) : (
						<>
							<div className='grid grid-cols-2 gap-3'>
								<ControlGroup label='Min' hint={String(min)}>
									<Slider
										value={min}
										onChange={v => {
											setMin(v)
											if (typeof previewValue === 'number' && previewValue < v) {
												setPreviewValue(v)
											}
										}}
										min={-100}
										max={max - 1}
									/>
								</ControlGroup>
								<ControlGroup label='Max' hint={String(max)}>
									<Slider
										value={max}
										onChange={v => {
											setMax(v)
											if (typeof previewValue === 'number' && previewValue > v) {
												setPreviewValue(v)
											}
										}}
										min={min + 1}
										max={200}
									/>
								</ControlGroup>
							</div>

							<ControlGroup label='Step' hint={String(step)}>
								<Slider
									value={step}
									onChange={setStep}
									min={1}
									max={Math.min(50, max - min)}
									handleSize='proportional'
									showSteps
								/>
							</ControlGroup>

							<ControlGroup label='Format'>
								<Slider
									mode='tabs'
									values={['—', '%', '$', '.00']}
									value={
										valueFormat === 'none'
											? '—'
											: valueFormat === 'percent'
												? '%'
												: valueFormat === 'currency'
													? '$'
													: '.00'
									}
									onChange={v =>
										setValueFormat(
											v === '—'
												? 'none'
												: v === '%'
													? 'percent'
													: v === '$'
														? 'currency'
														: 'decimal',
										)
									}
								/>
							</ControlGroup>
						</>
					)}

					<div className='h-px bg-gray-200' />

					<ControlGroup label='Label'>
						<input
							type='text'
							value={label}
							onChange={e => setLabel(e.target.value)}
							className='w-full px-2.5 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							placeholder='Optional...'
						/>
					</ControlGroup>

					<ControlGroup label='Handle'>
						<Slider
							mode='tabs'
							values={['Fixed', 'Auto']}
							value={handleSize === 'fixed' ? 'Fixed' : 'Auto'}
							onChange={v => setHandleSize(v === 'Fixed' ? 'fixed' : 'proportional')}
						/>
					</ControlGroup>

					<ControlGroup label='Step Dots'>
						<Slider
							mode='tabs'
							values={['Off', 'On']}
							value={showSteps ? 'On' : 'Off'}
							onChange={v => setShowSteps(v === 'On')}
						/>
					</ControlGroup>

					{showSteps && stepCount > 50 && (
						<p className='text-xs text-amber-600'>
							Hidden: too many steps ({stepCount})
						</p>
					)}
				</div>
			</aside>

			{/* Main area */}
			<div className='flex-1 flex flex-col'>
				{/* Preview - centered */}
				<div className='flex-1 flex items-center justify-center p-12'>
					<div className='w-full max-w-md'>
						{useDiscreteValues ? (
							<Slider
								key={`discrete-${parsedDiscreteValues.join(',')}-${mode}`}
								value={previewValue as string}
								onChange={v => setPreviewValue(v)}
								values={parsedDiscreteValues}
								label={label || undefined}
								mode={mode}
								handleSize={handleSize}
								showSteps={showSteps}
							/>
						) : (
							<Slider
								key={`numeric-${min}-${max}-${step}`}
								value={previewValue as number}
								onChange={v => setPreviewValue(v)}
								min={min}
								max={max}
								step={step}
								label={label || undefined}
								handleSize={handleSize}
								showSteps={showSteps}
								renderValue={getRenderValue()}
							/>
						)}

						<div className='mt-8 text-center'>
							<span className='inline-block px-4 py-2 text-lg font-mono text-gray-700 bg-gray-100 rounded-lg'>
								{String(previewValue)}
							</span>
						</div>
					</div>
				</div>

				{/* Code - bottom */}
				<div className='bg-gray-900 border-t border-gray-800'>
					<div className='px-5 py-4'>
						<div className='flex items-center justify-between mb-2'>
							<span className='text-[10px] font-medium text-gray-500 uppercase tracking-wider'>
								JSX
							</span>
							<button
								onClick={() => navigator.clipboard.writeText(generatedCode)}
								className='text-[10px] text-gray-500 hover:text-gray-300 uppercase tracking-wider transition-colors'
							>
								Copy
							</button>
						</div>
						<pre className='text-sm text-emerald-400 font-mono overflow-x-auto'>
							<code>{generatedCode}</code>
						</pre>
					</div>
				</div>
			</div>
		</div>
	)
}

// Color swatch component for the color picker example
const ColorSwatch = ({ color, ring }: { color: string; ring?: string }) => (
	<div
		className='w-5 h-5 rounded-full border border-gray-200'
		style={{
			backgroundColor: color,
			boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
		}}
	/>
)

// Color options with optional ring colors
const colorOptions = [
	{ id: 'white', color: '#f5f5f5' },
	{ id: 'black', color: '#1a1a1a' },
	{ id: 'black-yellow', color: '#1a1a1a', ring: '#facc15' },
	{ id: 'black-red', color: '#1a1a1a', ring: '#ef4444' },
	{ id: 'cyan', color: '#67e8f9' },
	{ id: 'green', color: '#4ade80' },
	{ id: 'lime', color: '#d9f99d' },
	{ id: 'coral', color: '#f87171' },
]

const Examples = () => {
	const [value1, setValue1] = useState(25)
	const [value2, setValue2] = useState(3)
	const [value3, setValue3] = useState(75)
	const [value4, setValue4] = useState('medium')
	const [value5, setValue5] = useState(3)
	const [value6, setValue6] = useState('M')
	const [colorValue, setColorValue] = useState('black')

	const examples = [
		{
			title: 'Basic',
			description: 'Continuous slider with proportional handle.',
			component: (
				<Slider
					value={value1}
					onChange={setValue1}
					label='Volume'
					min={0}
					max={100}
					handleSize='proportional'
				/>
			),
			value: value1,
		},
		{
			title: 'Stepped',
			description: 'Numeric values with step indicators.',
			component: (
				<Slider
					value={value2}
					onChange={setValue2}
					min={1}
					max={5}
					step={1}
					label='Rating'
					handleSize='proportional'
					showSteps
				/>
			),
			value: value2,
		},
		{
			title: 'Formatted',
			description: 'Custom value rendering.',
			component: (
				<Slider value={value3} onChange={setValue3} renderValue={v => `${v}%`} />
			),
			value: `${value3}%`,
		},
		{
			title: 'Tabs',
			description: 'Labels inside the track.',
			component: (
				<Slider
					value={value4}
					onChange={setValue4}
					mode='tabs'
					values={['small', 'medium', 'large']}
				/>
			),
			value: value4,
		},
		{
			title: 'Step Dots',
			description: 'Dots appear on hover.',
			component: (
				<Slider
					value={value5}
					onChange={setValue5}
					min={1}
					max={5}
					step={1}
					label='Level'
					showSteps
					handleSize='proportional'
				/>
			),
			value: value5,
		},
		{
			title: 'Discrete',
			description: 'String values with dots.',
			component: (
				<Slider
					value={value6}
					onChange={setValue6}
					values={['XS', 'S', 'M', 'L', 'XL']}
					showSteps
				/>
			),
			value: value6,
		},
		{
			title: 'Color Picker',
			description: 'Custom rendered color swatches.',
			component: (
				<Slider
					value={colorValue}
					onChange={setColorValue}
					values={colorOptions.map(c => c.id)}
					label='Style'
					renderValue={v => {
						const opt = colorOptions.find(c => c.id === v)
						return opt ? <ColorSwatch color={opt.color} ring={opt.ring} /> : v
					}}
				/>
			),
			value: colorValue,
		},
	]

	return (
		<div className='p-8 lg:p-12'>
			<div className='max-w-4xl mx-auto grid sm:grid-cols-2 gap-6'>
				{examples.map((example, i) => (
					<div
						key={i}
						className='p-5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-colors'
					>
						<div className='flex items-start justify-between mb-3'>
							<div>
								<h3 className='font-medium text-gray-900 text-sm'>{example.title}</h3>
								<p className='text-xs text-gray-500'>{example.description}</p>
							</div>
							<span className='text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded'>
								{String(example.value)}
							</span>
						</div>
						{example.component}
					</div>
				))}
			</div>
		</div>
	)
}

export const Demo = () => {
	const [activeTab, setActiveTab] = useState<'playground' | 'examples'>('playground')

	return (
		<div className='min-h-screen bg-gray-100'>
			{/* Header */}
			<header className='bg-white border-b border-gray-200'>
				<div className='flex items-center justify-between px-4 h-16'>
					<div className='flex items-center gap-3'>
						<h1 className='font-semibold text-gray-900'>Magic Slider</h1>
						<span className='text-xs text-gray-400'>React component</span>
					</div>
					<div className='w-48'>
						<Slider
							mode='tabs'
							values={['Playground', 'Examples']}
							value={activeTab === 'playground' ? 'Playground' : 'Examples'}
							onChange={v => setActiveTab(v === 'Playground' ? 'playground' : 'examples')}
						/>
					</div>
				</div>
			</header>

			{activeTab === 'playground' ? <Playground /> : <Examples />}
		</div>
	)
}
