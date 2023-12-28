import {useState} from "react"
import {Composition} from "remotion";
import { z } from "zod";

// 相対パスで指定する必要がある。
import { ImageVideoRenderer } from "../components/ImageVideoRenderer";

const myVideoPropsSchema = z.object({
	title: z.string(),
});

export const RemotionRoot: React.FC = () => {
  // DurationInFrames の状態を管理
  const [durationInFrames, setDurationInFrames] = useState(250); // 初期値は任意
	return (
		<>
			<Composition
				id="Preview"
				component={ImageVideoRenderer}
				durationInFrames={durationInFrames}
				fps={30}
				width={960}
				height={540}
				defaultProps={{
					title: "Hi",
				}}
				schema={myVideoPropsSchema}
			/>
		</>
	);
};
