export interface Account {
	id: string;
	name: string;
	email: string;
	password: string;
	status: number;
	last_login_at: Date | null;
	created_at: Date;
	updated_at: Date;
}

export interface NewAccount {
	id: string;
	name: string;
	email: string;
	password: string;
	status?: number;
	last_login_at?: Date | null;
	created_at?: Date;
	updated_at?: Date;
}
