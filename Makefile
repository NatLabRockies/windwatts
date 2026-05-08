.PHONY: all lint format test build-ui verify

lint:
	$(MAKE) -C windwatts-api lint
	cd windwatts-ui && npm run lint

format:
	$(MAKE) -C windwatts-api format
	cd windwatts-ui && npm run format

test:
	$(MAKE) -C windwatts-api test
	cd windwatts-ui && npm run test -- --run

build-ui:
	cd windwatts-ui && npm run build

verify: lint test build-ui

