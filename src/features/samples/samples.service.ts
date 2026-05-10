import { Injectable } from "@nestjs/common";
import { MessageEvent } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import { Readable } from "node:stream";
import { StreamableFile } from "@nestjs/common";

@Injectable()
export class SamplesService {
	getStreamFile(count: number): StreamableFile {
		const generator = async function* () {
			for (let i = 0; i < count; i++) {
				yield `${JSON.stringify({
					id: i + 1,
					message: `这是第 ${i + 1} 条数据`,
					timestamp: new Date().toISOString(),
				})}
`;
				await new Promise((r) => setTimeout(r, 500));
			}
		};
		return new StreamableFile(Readable.from(generator()));
	}

	createSseStream(count: number): Observable<MessageEvent> {
		const subject = new Subject<MessageEvent>();
		let i = 0;
		const timer = setInterval(() => {
			if (i < count) {
				subject.next({
					data: {
						id: i + 1,
						message: `第 ${i + 1} 条`,
						timestamp: new Date().toISOString(),
					},
				});
				i++;
			} else {
				clearInterval(timer);
				subject.complete();
			}
		}, 500);
		return subject.asObservable();
	}
}
