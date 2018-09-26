export const getRawTranslationUnits = data => {
    const xliff = data.xliff;
    const file = xliff.file[0];
    const body = file.body[0];
    const rawTranslationUnits = body['trans-unit'];
  
    return rawTranslationUnits;
};