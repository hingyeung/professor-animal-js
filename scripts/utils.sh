function build_artefact_name {
    SNAPSHOT=`test -z "$(git status --porcelain)" || echo '-snapshot'`
    git log -1 --pretty=format:"%h${SNAPSHOT}"
}