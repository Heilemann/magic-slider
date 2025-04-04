# MagicSlider

A flexible and customizable slider component for React with TypeScript support.

## Features

- Supports both continuous and discrete values
- Customizable appearance with Tailwind CSS
- Smooth animations with React Spring
- TypeScript support
- Controlled and uncontrolled modes
- Tab mode for discrete values

## Installation

```bash
npm install magicslider
```

## Usage

```tsx
import { Slider } from 'magicslider'

function App() {
	const [value, setValue] = useState(50)

	return (
		<Slider
			value={value}
			onChange={setValue}
			min={0}
			max={100}
			step={1}
			label='Volume'
		/>
	)
}
```

## Props

| Prop         | Type                          | Default   | Description                         |
| ------------ | ----------------------------- | --------- | ----------------------------------- |
| value        | number \| string              | -         | Controlled value                    |
| defaultValue | number \| string              | -         | Default value for uncontrolled mode |
| onChange     | (value: T) => void            | -         | Callback when value changes         |
| label        | string                        | -         | Label text                          |
| min          | number                        | 0         | Minimum value                       |
| max          | number                        | 100       | Maximum value                       |
| step         | number                        | 1         | Step size                           |
| values       | T[]                           | -         | Array of discrete values            |
| className    | string                        | ''        | Additional CSS classes              |
| renderValue  | (value: T) => React.ReactNode | -         | Custom value renderer               |
| mode         | 'default' \| 'tabs'           | 'default' | Slider mode                         |

## License

MIT
