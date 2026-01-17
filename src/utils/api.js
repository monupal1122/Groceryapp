/**
 * Enhanced fetch with timeout and retry logic to handle slow backend wake-ups.
 */
export const fetchWithRetry = async (url, options = {}, retries = 3, backoff = 1000) => {
    const { timeout = 30000, onRetry, ...fetchOptions } = options;

    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            console.log(`API [Attempt ${i + 1}]: Fetching ${url}`);
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
            });

            clearTimeout(id);

            if (response.ok) {
                return response;
            }

            // If not OK but potentially retriable
            if (response.status >= 500) {
                throw new Error(`Server Error: ${response.status}`);
            }

            // If client error, don't retry
            return response;

        } catch (err) {
            clearTimeout(id);
            const isLastAttempt = i === retries - 1;

            if (err.name === 'AbortError') {
                console.warn(`API [Attempt ${i + 1}]: Timeout for ${url}`);
            } else {
                console.error(`API [Attempt ${i + 1}]: Error - ${err.message}`);
            }

            if (isLastAttempt) throw err;

            if (onRetry) onRetry(i + 1, err);

            // Wait before next retry
            const waitTime = backoff * Math.pow(2, i);
            console.log(`API: Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};
