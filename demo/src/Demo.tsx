import React, { useState } from 'react'
import { Slider } from '../../src'
import './index.css'

export const Demo = () => {
	const [value1, setValue1] = useState(25)
	const [value2, setValue2] = useState(3)
	const [value3, setValue3] = useState(75)
	const [value4, setValue4] = useState('medium')
	const [value5, setValue5] = useState(50)

	return (
		<div className='p-4 max-w-sm mx-auto'>
			<h1 className='text-3xl font-bold mb-8'>Magic Slider Demo</h1>

			<div className='space-y-8'>
				{/* Example 1: Labeled slider with min/max */}
				<div>
					<h2 className='text-xl font-semibold mb-2'>1. Labeled Slider</h2>
					<p className='text-gray-600 mb-4'>
						Slider with label and min/max values
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
					<p className='text-gray-600 mb-4'>Slider with discrete steps (1-5)</p>
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
						Slider with custom value formatting
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
						Slider in tab mode with predefined values
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
			</div>
		</div>
	)
}
