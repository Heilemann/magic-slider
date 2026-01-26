import { animated, useSpring } from '@react-spring/web'
import React, { useCallback, useEffect, useRef, useState } from 'react'

// Inject CSS styles directly
const injectStyles = () => {
	if (typeof document !== 'undefined') {
		// Check if styles are already injected
		if (!document.getElementById('magic-slider-styles')) {
			const styleSheet = document.createElement('style')
			styleSheet.id = 'magic-slider-styles'
			styleSheet.textContent = `
				/* Slider container */
				.magic-slider {
					position: relative;
					height: 2.25rem;
					user-select: none;
					overflow: hidden;
					border-radius: 0.375rem;
					background-color: rgba(0, 0, 0, 0.05);
					outline: none;
					touch-action: none;
				}

				.magic-slider:focus-visible {
					outline: 2px solid rgb(59, 130, 246);
					outline-offset: 2px;
				}

				/* Slider label */
				.magic-slider-label {
					pointer-events: none;
					position: absolute;
					left: 0.75rem;
					top: 50%;
					z-index: 10;
					transform: translateY(-50%);
					font-size: 0.875rem;
					color: rgb(17, 24, 39);
				}

				/* Slider value display */
				.magic-slider-value {
					pointer-events: none;
					position: absolute;
					right: 0.75rem;
					top: 50%;
					z-index: 10;
					transform: translateY(-50%);
					font-size: 0.875rem;
					color: rgb(107, 114, 128);
				}

				/* Slider handle */
				.magic-slider-handle {
					position: absolute;
					top: 0;
					height: 100%;
					border-radius: 0.375rem;
					background-color: rgba(0, 0, 0, 0.1);
					cursor: grab;
					transition: none;
				}

				.magic-slider-handle:hover {
					background-color: rgba(0, 0, 0, 0.2);
				}

				.magic-slider-handle:active {
					cursor: grabbing;
				}

				/* Slider tabs container */
				.magic-slider-tabs {
					position: absolute;
					top: 0;
					display: flex;
					height: 100%;
					width: 100%;
				}

				/* Slider tab */
				.magic-slider-tab {
					display: flex;
					height: 100%;
					flex: 1;
					cursor: pointer;
					align-items: center;
					justify-content: center;
					font-size: 0.875rem;
					transition-property: color;
					transition-duration: 200ms;
				}

				.magic-slider-tab.active {
					color: rgb(0, 0, 0);
				}

				.magic-slider-tab.inactive {
					color: rgb(107, 114, 128);
				}

				.magic-slider-tab.inactive:hover {
					color: rgb(0, 0, 0);
				}

				/* Clickable area */
				.magic-slider-clickable {
					position: absolute;
					inset: 0;
					cursor: pointer;
				}
			`
			document.head.appendChild(styleSheet)
		}
	}
}

/** Supported value types for the slider */
type SliderValue = number | string

/**
 * Props for the Slider component
 * @template T - The type of value the slider handles (number or string)
 */
interface SliderProps<T extends SliderValue> {
	/** Controlled value - use with onChange for controlled component */
	value?: T
	/** Initial value for uncontrolled component */
	defaultValue?: T
	/** Callback fired when the value changes */
	onChange?: (value: T) => void
	/** Label displayed on the slider */
	label?: string
	/** Minimum value (default: 0). Ignored when using discrete `values` */
	min?: number
	/** Maximum value (default: 100). Ignored when using discrete `values` */
	max?: number
	/** Step increment (default: 1). Ignored when using discrete `values` */
	step?: number
	/** Array of discrete values. When provided, the slider snaps to these values only */
	values?: T[]
	/** Additional CSS class for the slider container */
	className?: string
	/** Custom render function for the value display */
	renderValue?: (value: T) => React.ReactNode
	/** Display mode: 'default' shows label/value, 'tabs' shows clickable segments */
	mode?: 'default' | 'tabs'
	/** Handle sizing: 'fixed' (24px) or 'proportional' (based on step) */
	handleSize?: 'fixed' | 'proportional'
	/** Accessible label for screen readers (uses label prop if not provided) */
	'aria-label'?: string
	/** ID of element that labels this slider */
	'aria-labelledby'?: string
}

const HANDLE_WIDTH_CONTINUOUS = 24

const SliderLabel = React.memo(({ label }: { label?: string }) => {
	if (!label) return null
	return <div className='magic-slider-label'>{label}</div>
})

const SliderValue = <T extends SliderValue>({
	value,
	renderValue,
	getDisplayValue,
}: {
	value: T
	renderValue?: (value: T) => React.ReactNode
	getDisplayValue: () => string | T
}) => (
	<div className='magic-slider-value'>
		{renderValue ? renderValue(value) : getDisplayValue()}
	</div>
)

const SliderHandle = <T extends SliderValue>({
	handleWidth,
	position,
	mode,
	value,
	values,
	renderValue,
}: {
	handleWidth: number
	position: number
	mode?: 'default' | 'tabs'
	value: T
	values?: T[]
	renderValue?: (value: T) => React.ReactNode
}) => {
	const springs = useSpring({
		transform: `translateX(${position}px)`,
		config: { tension: 200, friction: 20 },
	})

	if (mode === 'tabs' && values) {
		return (
			<>
				<animated.div
					className='magic-slider-handle'
					style={{
						width: handleWidth,
						...springs,
					}}
				/>
				<div className='magic-slider-tabs'>
					{values.map((v, i) => (
						<div
							key={i}
							className={`magic-slider-tab ${
								v === value ? 'active' : 'inactive'
							}`}
						>
							{renderValue ? renderValue(v) : v}
						</div>
					))}
				</div>
			</>
		)
	}

	return (
		<animated.div
			className='magic-slider-handle'
			style={{
				width: handleWidth,
				...springs,
			}}
		/>
	)
}

const ClickableArea = React.memo(() => <div className='magic-slider-clickable' />)

function Slider<T extends SliderValue>({
	value: controlledValue,
	defaultValue,
	onChange,
	label,
	min = 0,
	max = 100,
	step = 1,
	values,
	className = '',
	renderValue,
	mode = 'default',
	handleSize = 'fixed',
	'aria-label': ariaLabel,
	'aria-labelledby': ariaLabelledBy,
}: SliderProps<T>) {
	// Inject styles on component mount
	useEffect(() => {
		injectStyles()
	}, [])

	// Validate props in development mode
	useEffect(() => {
		if (process.env.NODE_ENV === 'production') return

		if (values !== undefined && values.length === 0) {
			console.warn(
				'[Slider] The `values` prop is an empty array. Provide at least one value or remove the prop.',
			)
		}

		if (min >= max) {
			console.warn(
				`[Slider] \`min\` (${min}) should be less than \`max\` (${max}).`,
			)
		}

		if (step <= 0) {
			console.warn(
				`[Slider] \`step\` (${step}) should be greater than 0.`,
			)
		}

		if (!values && typeof controlledValue === 'number') {
			if (controlledValue < min || controlledValue > max) {
				console.warn(
					`[Slider] \`value\` (${controlledValue}) is outside the range [${min}, ${max}].`,
				)
			}
		}

		if (values && controlledValue !== undefined && !values.includes(controlledValue)) {
			console.warn(
				`[Slider] \`value\` (${controlledValue}) is not in the \`values\` array.`,
			)
		}
	}, [values, min, max, step, controlledValue])

	const isDiscrete = Boolean(values)
	const sliderRef = useRef<HTMLDivElement>(null)
	const [handleWidth, setHandleWidth] = useState(HANDLE_WIDTH_CONTINUOUS)
	const [isDragging, setIsDragging] = useState(false)
	const startValueRef = useRef(0)
	const startXRef = useRef(0)
	// Cache bounding rect during drag to avoid layout thrashing
	const cachedRectRef = useRef<DOMRect | null>(null)

	// Internal state for uncontrolled mode
	const [internalValue, setInternalValue] = useState<T>(() => {
		if (controlledValue !== undefined) return controlledValue
		if (defaultValue !== undefined) return defaultValue
		return min as T // Fallback to min value
	})

	// Use controlled value if provided, otherwise use internal state
	const value = controlledValue !== undefined ? controlledValue : internalValue

	// Handle value changes
	const handleChange = useCallback(
		(newValue: T) => {
			// In uncontrolled mode, update internal state
			if (controlledValue === undefined) {
				setInternalValue(newValue)
			}
			// Always call onChange if provided
			onChange?.(newValue)
		},
		[controlledValue, onChange],
	)

	// Update handle width when container size or discrete values change
	useEffect(() => {
		if (!sliderRef.current) return
		const totalWidth = sliderRef.current.getBoundingClientRect().width
		if (isDiscrete && values) {
			setHandleWidth(totalWidth / values.length)
		} else if (handleSize === 'proportional') {
			const stepWidth = (totalWidth / (max - min)) * step
			setHandleWidth(stepWidth)
		} else {
			setHandleWidth(HANDLE_WIDTH_CONTINUOUS)
		}
	}, [isDiscrete, values, handleSize, step, max, min])

	// Get current value as a percentage (0-100)
	const getCurrentValue = useCallback(() => {
		if (isDiscrete && values) {
			const index = values.indexOf(value)
			return (index / (values.length - 1)) * 100
		}
		return Number(value)
	}, [isDiscrete, value, values])

	// Shared logic for starting a drag (mouse or touch)
	const startDrag = useCallback(
		(clientX: number) => {
			const rect = sliderRef.current?.getBoundingClientRect()
			if (!rect) return

			// Cache the rect for use during drag to avoid repeated layout calculations
			cachedRectRef.current = rect

			if (mode === 'tabs' && values) {
				const relativeX = clientX - rect.left
				const index = Math.floor((relativeX / rect.width) * values.length)
				handleChange(values[index])
				setIsDragging(true)
				startValueRef.current = index
				startXRef.current = clientX - rect.left
				return
			}

			// For binary discrete values, just toggle
			if (isDiscrete && values && values.length === 2) {
				const currentIndex = values.indexOf(value)
				const nextIndex = currentIndex === 0 ? 1 : 0
				handleChange(values[nextIndex])
				return
			}

			setIsDragging(true)
			startValueRef.current = getCurrentValue()
			startXRef.current = clientX - rect.left
		},
		[getCurrentValue, isDiscrete, handleChange, value, values, mode],
	)

	// Handle mouse down event
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()
			startDrag(e.clientX)
		},
		[startDrag],
	)

	// Handle touch start event
	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (e.touches.length !== 1) return
			startDrag(e.touches[0].clientX)
		},
		[startDrag],
	)

	// Shared logic for moving during drag (mouse or touch)
	const moveDrag = useCallback(
		(clientX: number) => {
			if (!isDragging) return

			// Use cached rect to avoid layout thrashing during drag
			const rect = cachedRectRef.current
			if (!rect) return

			const relativeX = Math.max(0, Math.min(rect.width, clientX - rect.left))

			if (mode === 'tabs' && values) {
				const index = Math.floor((relativeX / rect.width) * values.length)
				handleChange(values[index])
				return
			}

			if (isDiscrete && values) {
				// For discrete values, always use zone-based mapping
				const index = Math.round((relativeX / rect.width) * (values.length - 1))
				handleChange(values[index])
				return
			}

			// Calculate step width in pixels
			const stepWidth = (rect.width / (max - min)) * step

			if (stepWidth > handleWidth) {
				// For large steps, use direct position mapping
				const newValue =
					min +
					Math.round(((relativeX / rect.width) * (max - min)) / step) * step
				handleChange(newValue as T)
			} else {
				// For small steps, use delta-based movement
				const delta = relativeX - startXRef.current
				let newValue =
					startValueRef.current + (delta / rect.width) * (max - min)
				newValue = Math.max(min, Math.min(max, newValue))
				const stepped = Math.round(newValue / step) * step
				handleChange(stepped as T)
			}
		},
		[
			isDragging,
			isDiscrete,
			max,
			min,
			handleChange,
			step,
			values,
			handleWidth,
			mode,
		],
	)

	// Mouse move handler (native event)
	const handleMouseMove = useCallback(
		(e: globalThis.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()
			moveDrag(e.clientX)
		},
		[moveDrag],
	)

	// Touch move handler (native event)
	const handleTouchMove = useCallback(
		(e: globalThis.TouchEvent) => {
			if (e.touches.length !== 1) return
			e.preventDefault()
			moveDrag(e.touches[0].clientX)
		},
		[moveDrag],
	)

	const handleMouseUp = useCallback(() => {
		setIsDragging(false)
		cachedRectRef.current = null
	}, [])

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (isDiscrete && values) {
				const currentIndex = values.indexOf(value)
				let newIndex = currentIndex

				switch (e.key) {
					case 'ArrowRight':
					case 'ArrowUp':
						e.preventDefault()
						newIndex = Math.min(currentIndex + 1, values.length - 1)
						break
					case 'ArrowLeft':
					case 'ArrowDown':
						e.preventDefault()
						newIndex = Math.max(currentIndex - 1, 0)
						break
					case 'Home':
						e.preventDefault()
						newIndex = 0
						break
					case 'End':
						e.preventDefault()
						newIndex = values.length - 1
						break
					default:
						return
				}

				if (newIndex !== currentIndex) {
					handleChange(values[newIndex])
				}
			} else {
				const numValue = Number(value)
				let newValue = numValue

				switch (e.key) {
					case 'ArrowRight':
					case 'ArrowUp':
						e.preventDefault()
						newValue = Math.min(numValue + step, max)
						break
					case 'ArrowLeft':
					case 'ArrowDown':
						e.preventDefault()
						newValue = Math.max(numValue - step, min)
						break
					case 'Home':
						e.preventDefault()
						newValue = min
						break
					case 'End':
						e.preventDefault()
						newValue = max
						break
					default:
						return
				}

				if (newValue !== numValue) {
					handleChange(newValue as T)
				}
			}
		},
		[isDiscrete, values, value, step, min, max, handleChange],
	)

	// Add and remove event listeners with native event types
	useEffect(() => {
		if (isDragging) {
			window.addEventListener('mousemove', handleMouseMove)
			window.addEventListener('mouseup', handleMouseUp)
			window.addEventListener('touchmove', handleTouchMove, { passive: false })
			window.addEventListener('touchend', handleMouseUp)
			window.addEventListener('touchcancel', handleMouseUp)
		} else {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
			window.removeEventListener('touchmove', handleTouchMove)
			window.removeEventListener('touchend', handleMouseUp)
			window.removeEventListener('touchcancel', handleMouseUp)
		}
		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
			window.removeEventListener('touchmove', handleTouchMove)
			window.removeEventListener('touchend', handleMouseUp)
			window.removeEventListener('touchcancel', handleMouseUp)
		}
	}, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove])

	// Format display value
	const getDisplayValue = useCallback(() => {
		if (typeof value === 'number') {
			return value.toFixed(step < 1 ? 2 : 0)
		}
		return value
	}, [step, value])

	// Calculate handle position
	const getHandlePosition = useCallback(() => {
		const totalWidth = sliderRef.current?.getBoundingClientRect().width || 200
		const maxOffset = totalWidth - handleWidth
		const currentVal = getCurrentValue() - (isDiscrete ? 0 : min)
		const range = isDiscrete ? 100 : max - min
		return (currentVal / range) * maxOffset
	}, [getCurrentValue, handleWidth, isDiscrete, max, min])

	// Compute ARIA values
	const ariaValueNow = isDiscrete && values ? values.indexOf(value) : Number(value)
	const ariaValueMin = isDiscrete && values ? 0 : min
	const ariaValueMax = isDiscrete && values ? values.length - 1 : max
	const ariaValueText = isDiscrete ? String(value) : undefined

	return (
		<div
			ref={sliderRef}
			className={`magic-slider ${className}`}
			onMouseDown={handleMouseDown}
			onTouchStart={handleTouchStart}
			onKeyDown={handleKeyDown}
			role="slider"
			tabIndex={0}
			aria-valuemin={ariaValueMin}
			aria-valuemax={ariaValueMax}
			aria-valuenow={ariaValueNow}
			aria-valuetext={ariaValueText}
			aria-label={ariaLabel || label}
			aria-labelledby={ariaLabelledBy}
		>
			<SliderLabel label={label} />
			{mode === 'default' && (
				<SliderValue
					value={value}
					renderValue={renderValue}
					getDisplayValue={getDisplayValue}
				/>
			)}
			<SliderHandle
				handleWidth={handleWidth}
				position={getHandlePosition()}
				mode={mode}
				value={value}
				values={values}
				renderValue={renderValue}
			/>
			<ClickableArea />
		</div>
	)
}

export { Slider }
export type { SliderProps, SliderValue }
