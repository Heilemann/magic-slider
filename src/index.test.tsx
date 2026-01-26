import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Slider } from './index'

describe('Slider', () => {
	describe('rendering', () => {
		it('renders without crashing', () => {
			render(<Slider />)
			expect(screen.getByRole('slider')).toBeInTheDocument()
		})

		it('renders with a label', () => {
			render(<Slider label="Volume" />)
			expect(screen.getByText('Volume')).toBeInTheDocument()
		})

		it('renders with correct ARIA attributes', () => {
			render(<Slider min={0} max={100} value={50} label="Volume" />)
			const slider = screen.getByRole('slider')
			expect(slider).toHaveAttribute('aria-valuemin', '0')
			expect(slider).toHaveAttribute('aria-valuemax', '100')
			expect(slider).toHaveAttribute('aria-valuenow', '50')
			expect(slider).toHaveAttribute('aria-label', 'Volume')
		})

		it('supports custom aria-label', () => {
			render(<Slider label="Volume" aria-label="Custom label" />)
			const slider = screen.getByRole('slider')
			expect(slider).toHaveAttribute('aria-label', 'Custom label')
		})
	})

	describe('controlled mode', () => {
		it('uses the provided value', () => {
			render(<Slider value={75} min={0} max={100} />)
			const slider = screen.getByRole('slider')
			expect(slider).toHaveAttribute('aria-valuenow', '75')
		})

		it('calls onChange when value changes via keyboard', async () => {
			const handleChange = vi.fn()
			render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowRight}')

			expect(handleChange).toHaveBeenCalledWith(51)
		})
	})

	describe('uncontrolled mode', () => {
		it('uses defaultValue as initial value', () => {
			render(<Slider defaultValue={25} min={0} max={100} />)
			const slider = screen.getByRole('slider')
			expect(slider).toHaveAttribute('aria-valuenow', '25')
		})

		it('updates value internally via keyboard', async () => {
			render(<Slider defaultValue={50} min={0} max={100} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowRight}')

			expect(slider).toHaveAttribute('aria-valuenow', '51')
		})
	})

	describe('discrete values', () => {
		it('renders with discrete string values', () => {
			const values = ['small', 'medium', 'large']
			render(<Slider values={values} value="medium" />)

			const slider = screen.getByRole('slider')
			expect(slider).toHaveAttribute('aria-valuenow', '1') // index of 'medium'
			expect(slider).toHaveAttribute('aria-valuetext', 'medium')
		})

		it('navigates discrete values with keyboard', async () => {
			const values = ['small', 'medium', 'large']
			const handleChange = vi.fn()
			render(<Slider values={values} value="small" onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowRight}')

			expect(handleChange).toHaveBeenCalledWith('medium')
		})

		it('respects bounds at start of discrete values', async () => {
			const values = ['small', 'medium', 'large']
			const handleChange = vi.fn()
			render(<Slider values={values} value="small" onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowLeft}')

			// Should not call onChange since we're already at the start
			expect(handleChange).not.toHaveBeenCalled()
		})

		it('respects bounds at end of discrete values', async () => {
			const values = ['small', 'medium', 'large']
			const handleChange = vi.fn()
			render(<Slider values={values} value="large" onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowRight}')

			// Should not call onChange since we're already at the end
			expect(handleChange).not.toHaveBeenCalled()
		})
	})

	describe('keyboard navigation', () => {
		it('increases value with ArrowRight', async () => {
			const handleChange = vi.fn()
			render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowRight}')

			expect(handleChange).toHaveBeenCalledWith(51)
		})

		it('decreases value with ArrowLeft', async () => {
			const handleChange = vi.fn()
			render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowLeft}')

			expect(handleChange).toHaveBeenCalledWith(49)
		})

		it('increases value with ArrowUp', async () => {
			const handleChange = vi.fn()
			render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowUp}')

			expect(handleChange).toHaveBeenCalledWith(51)
		})

		it('decreases value with ArrowDown', async () => {
			const handleChange = vi.fn()
			render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowDown}')

			expect(handleChange).toHaveBeenCalledWith(49)
		})

		it('goes to min with Home key', async () => {
			const handleChange = vi.fn()
			render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{Home}')

			expect(handleChange).toHaveBeenCalledWith(0)
		})

		it('goes to max with End key', async () => {
			const handleChange = vi.fn()
			render(<Slider value={50} min={0} max={100} onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{End}')

			expect(handleChange).toHaveBeenCalledWith(100)
		})

		it('respects step value', async () => {
			const handleChange = vi.fn()
			render(
				<Slider value={50} min={0} max={100} step={5} onChange={handleChange} />,
			)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowRight}')

			expect(handleChange).toHaveBeenCalledWith(55)
		})

		it('does not exceed max', async () => {
			const handleChange = vi.fn()
			render(<Slider value={100} min={0} max={100} onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowRight}')

			expect(handleChange).not.toHaveBeenCalled()
		})

		it('does not go below min', async () => {
			const handleChange = vi.fn()
			render(<Slider value={0} min={0} max={100} onChange={handleChange} />)

			const slider = screen.getByRole('slider')
			slider.focus()
			await userEvent.keyboard('{ArrowLeft}')

			expect(handleChange).not.toHaveBeenCalled()
		})
	})

	describe('tabs mode', () => {
		it('renders tab labels', () => {
			const values = ['S', 'M', 'L']
			render(<Slider values={values} value="M" mode="tabs" />)

			expect(screen.getByText('S')).toBeInTheDocument()
			expect(screen.getByText('M')).toBeInTheDocument()
			expect(screen.getByText('L')).toBeInTheDocument()
		})
	})

	describe('custom rendering', () => {
		it('uses custom renderValue function', () => {
			render(
				<Slider
					value={50}
					min={0}
					max={100}
					renderValue={(v) => `${v}%`}
				/>,
			)

			expect(screen.getByText('50%')).toBeInTheDocument()
		})
	})

	describe('showSteps', () => {
		it('renders step dots when showSteps is true', () => {
			const { container } = render(
				<Slider min={0} max={10} step={2} showSteps />,
			)

			const stepsContainer = container.querySelector('.magic-slider-steps')
			expect(stepsContainer).toBeInTheDocument()

			const dots = container.querySelectorAll('.magic-slider-step-dot')
			expect(dots.length).toBe(6) // 0, 2, 4, 6, 8, 10
		})

		it('does not render step dots when showSteps is false', () => {
			const { container } = render(
				<Slider min={0} max={10} step={2} showSteps={false} />,
			)

			const stepsContainer = container.querySelector('.magic-slider-steps')
			expect(stepsContainer).not.toBeInTheDocument()
		})

		it('renders dots for discrete values', () => {
			const values = ['small', 'medium', 'large']
			const { container } = render(
				<Slider values={values} value="medium" showSteps />,
			)

			const dots = container.querySelectorAll('.magic-slider-step-dot')
			expect(dots.length).toBe(3)
		})

		it('does not render dots when step count exceeds 50', () => {
			const { container } = render(
				<Slider min={0} max={100} step={1} showSteps />,
			)

			// 101 steps would exceed the 50 limit
			const stepsContainer = container.querySelector('.magic-slider-steps')
			expect(stepsContainer).not.toBeInTheDocument()
		})

		it('renders correct number of dots for step value', () => {
			const { container } = render(
				<Slider min={0} max={100} step={50} showSteps />,
			)

			const dots = container.querySelectorAll('.magic-slider-step-dot')
			expect(dots.length).toBe(3) // 0, 50, 100
		})
	})
})
