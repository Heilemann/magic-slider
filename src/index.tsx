import { animated, useSpring } from '@react-spring/web'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

type SliderValue = number | string

interface SliderProps<T extends SliderValue> {
	value?: T
	defaultValue?: T
	onChange?: (value: T) => void
	label?: string
	min?: number
	max?: number
	step?: number
	values?: T[]
	className?: string
	renderValue?: (value: T) => React.ReactNode
	mode?: 'default' | 'tabs'
	handleSize?: 'fixed' | 'proportional'
}

const HANDLE_WIDTH_CONTINUOUS = 24

const SliderLabel = ({ label }: { label?: string }) => {
	if (!label) return null
	return (
		<div className='pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-gray-900'>
			{label}
		</div>
	)
}

const SliderValue = <T extends SliderValue>({
	value,
	renderValue,
	getDisplayValue,
}: {
	value: T
	renderValue?: (value: T) => React.ReactNode
	getDisplayValue: () => string | T
}) => (
	<div className='pointer-events-none absolute right-3 top-1/2 z-10 -translate-y-1/2 text-sm text-gray-500'>
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
					className='absolute top-0 h-full rounded-md bg-black/10'
					style={{
						width: handleWidth,
						...springs,
					}}
				/>
				<div className='absolute top-0 flex h-full w-full'>
					{values.map((v, i) => (
						<div
							key={i}
							className={twMerge(
								'flex h-full flex-1 cursor-pointer items-center justify-center text-sm transition-colors duration-200',
								v === value ? 'text-black' : 'text-gray-500 hover:text-black',
							)}
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
			className='absolute top-0 h-full cursor-grab rounded-md bg-black/10 transition-none hover:bg-black/20 active:cursor-grabbing'
			style={{
				width: handleWidth,
				...springs,
			}}
		/>
	)
}

const ClickableArea = () => <div className='absolute inset-0 cursor-pointer' />

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
}: SliderProps<T>) {
	const isDiscrete = Boolean(values)
	const sliderRef = useRef<HTMLDivElement>(null)
	const [handleWidth, setHandleWidth] = useState(HANDLE_WIDTH_CONTINUOUS)
	const [isDragging, setIsDragging] = useState(false)
	const startValueRef = useRef(0)
	const startXRef = useRef(0)

	// Internal state for uncontrolled mode
	const [internalValue, setInternalValue] = useState<T>(() => {
		if (controlledValue !== undefined) return controlledValue
		if (defaultValue !== undefined) return defaultValue
		return min as T // Fallback to min value
	})

	// Use controlled value if provided, otherwise use internal state
	const value = controlledValue !== undefined ? controlledValue : internalValue

	// Handle value changes
	const handleChange = (newValue: T) => {
		// In uncontrolled mode, update internal state
		if (controlledValue === undefined) {
			setInternalValue(newValue)
		}
		// Always call onChange if provided
		onChange?.(newValue)
	}

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
	}, [
		isDiscrete,
		values,
		sliderRef.current?.getBoundingClientRect().width,
		handleSize,
		step,
		max,
		min,
	])

	// Get current value as a percentage (0-100)
	const getCurrentValue = useCallback(() => {
		if (isDiscrete && values) {
			const index = values.indexOf(value)
			return (index / (values.length - 1)) * 100
		}
		return Number(value)
	}, [isDiscrete, value, values])

	// Handle mouse down event
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault()
			e.stopPropagation()

			const rect = sliderRef.current?.getBoundingClientRect()
			if (!rect) return

			if (mode === 'tabs' && values) {
				const relativeX = e.clientX - rect.left
				const index = Math.floor((relativeX / rect.width) * values.length)
				handleChange(values[index])
				setIsDragging(true)
				startValueRef.current = index
				startXRef.current = e.clientX - rect.left
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
			startXRef.current = e.clientX - rect.left
		},
		[getCurrentValue, isDiscrete, handleChange, value, values, mode],
	)

	// NOTE: Here is the critical difference:
	// these two handlers accept the native "globalThis.MouseEvent",
	// not React's synthetic "React.MouseEvent"
	const handleMouseMove = useCallback(
		(e: globalThis.MouseEvent) => {
			if (!isDragging || !sliderRef.current) return

			e.preventDefault()
			e.stopPropagation()

			const rect = sliderRef.current.getBoundingClientRect()
			const relativeX = Math.max(0, Math.min(rect.width, e.clientX - rect.left))

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

	const handleMouseUp = useCallback(() => {
		setIsDragging(false)
	}, [])

	// Add and remove event listeners with native event types
	useEffect(() => {
		if (isDragging) {
			window.addEventListener('mousemove', handleMouseMove)
			window.addEventListener('mouseup', handleMouseUp)
		} else {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDragging, handleMouseMove, handleMouseUp])

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

	return (
		<div
			ref={sliderRef}
			className={twMerge(
				'relative h-9 select-none overflow-hidden rounded-md bg-black/5',
				className,
			)}
			onMouseDown={handleMouseDown}
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
