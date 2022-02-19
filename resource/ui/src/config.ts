export interface ResourceConfig {
  zomeName: string;
  avatarMode: 'identicon' | 'avatar';
  additionalFields: string[];
  minNicknameLength: number;
}

export const defaultConfig: ResourceConfig = {
  zomeName: 'resource',
  avatarMode: 'avatar',
  additionalFields: [],
  minNicknameLength: 3,
};
