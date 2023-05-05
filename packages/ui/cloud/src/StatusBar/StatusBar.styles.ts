import tw from 'twin.macro';

/**
 * This value is not the one created by the `createStyles` method.
 *
 * It is a value to be used as part of the argument for the `createStyles`
 * method.
 *
 * We provide this instead here so that it can be merged into
 *
 * - `CloudAttachmentElement.styles.ts`
 * - `CloudImageElement.styles.ts`
 */
export const statusBarStyleValues = {
  progressBarTrack: [tw`h-4 bg-gray-100 rounded-lg shadow-md`],
  progressBarBar: [tw`h-4 duration-100 bg-blue-500 rounded-lg`],
  failBar: [
    tw`h-4 text-xs font-bold leading-tight text-center text-white uppercase bg-red-700 border rounded-lg shadow-md`,
  ],
};
