import React, { useState } from 'react'
import { Slider } from '../../src'
import './index.css'

export const Demo = () => {
	const [value1, setValue1] = useState(25)
	const [value2, setValue2] = useState(3)
	const [value3, setValue3] = useState(75)
	const [value4, setValue4] = useState('medium')
	const [value5, setValue5] = useState(3)
	const [value6, setValue6] = useState('M')

	return (
		<div className='p-4 max-w-sm mx-auto'>
			<h1 className='text-3xl font-bold mb-8'>Magic Slider Demo</h1>

			<div className='space-y-8'>
				{/* Example 1: Labeled slider with min/max */}
				<div>
					<h2 className='text-xl font-semibold mb-2'>1. Labeled Slider</h2>
					<p className='text-gray-600 mb-4'>
						A continuous slider with a label on the left and value on the right.
						Uses <code className='text-xs bg-gray-100 px-1 rounded'>handleSize="proportional"</code> so
						the handle width scales with the step size.
					</p>
					<Slider
						value={value1}
						onChange={setValue1}
						label='Volume'
						min={0}
						max={100}
						handleSize='proportional'
						className='w-full'
					/>
					<div className='mt-2 text-sm text-gray-500'>Volume: {value1}</div>
				</div>

				{/* Example 2: Discrete slider with steps */}
				<div>
					<h2 className='text-xl font-semibold mb-2'>2. Step Slider</h2>
					<p className='text-gray-600 mb-4'>
						Numeric slider that snaps to integer values 1-5. The proportional handle
						expands to show each step as a distinct zone. Great for ratings or
						settings with few options.
					</p>
					<Slider
						value={value2}
						onChange={setValue2}
						min={1}
						max={5}
						step={1}
						label='Rating'
						handleSize='proportional'
						className='w-full'
					/>
					<div className='mt-2 text-sm text-gray-500'>Rating: {value2}</div>
				</div>

				{/* Example 3: Custom value rendering */}
				<div>
					<h2 className='text-xl font-semibold mb-2'>
						3. Custom Value Display
					</h2>
					<p className='text-gray-600 mb-4'>
						Uses <code className='text-xs bg-gray-100 px-1 rounded'>renderValue</code> to
						format the displayed value with a percent sign. The handle uses the
						default fixed width of 24px.
					</p>
					<Slider
						value={value3}
						onChange={setValue3}
						renderValue={value => `${value}%`}
						className='w-full'
					/>
					<div className='mt-2 text-sm text-gray-500'>Value: {value3}%</div>
				</div>

				{/* Example 4: Tab mode */}
				<div>
					<h2 className='text-xl font-semibold mb-2'>4. Tab Mode</h2>
					<p className='text-gray-600 mb-4'>
						Switches to <code className='text-xs bg-gray-100 px-1 rounded'>mode="tabs"</code> which
						displays labels for each discrete value inside the track. Click anywhere
						to select, or drag to slide between options.
					</p>
					<Slider
						value={value4}
						onChange={setValue4}
						mode='tabs'
						values={['small', 'medium', 'large']}
						className='w-full'
					/>
					<div className='mt-2 text-sm text-gray-500'>Size: {value4}</div>
				</div>

				{/* Example 5: Step dots */}
				<div>
					<h2 className='text-xl font-semibold mb-2'>5. Step Dots</h2>
					<p className='text-gray-600 mb-4'>
						Enable <code className='text-xs bg-gray-100 px-1 rounded'>showSteps</code> to
						reveal indicator dots on hover. Dots animate in with a spring effect
						and fade out when the handle covers them.
					</p>
					<Slider
						value={value5}
						onChange={setValue5}
						min={1}
						max={5}
						step={1}
						label='Level'
						showSteps
						handleSize='proportional'
						className='w-full'
					/>
					<div className='mt-2 text-sm text-gray-500'>Level: {value5}</div>
				</div>

				{/* Example 6: Step dots with discrete values */}
				<div>
					<h2 className='text-xl font-semibold mb-2'>6. Step Dots (Discrete)</h2>
					<p className='text-gray-600 mb-4'>
						Step dots also work with the <code className='text-xs bg-gray-100 px-1 rounded'>values</code> array
						for string-based options. Dots are positioned at the center of each
						handle stop position.
					</p>
					<Slider
						value={value6}
						onChange={setValue6}
						values={['XS', 'S', 'M', 'L', 'XL']}
						showSteps
						className='w-full'
					/>
					<div className='mt-2 text-sm text-gray-500'>Size: {value6}</div>
				</div>
			</div>
		</div>
	)
}
